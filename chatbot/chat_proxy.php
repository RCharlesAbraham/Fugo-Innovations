<?php
// chatbot/chat_proxy.php
// Lightweight local search proxy for demo chatbot.
// - Accepts POST JSON: { "message": "..." }
// - Searches the repository's HTML files for matching text and returns JSON:
//   { ok: true, reply: "...", source: "local", links: [ {title, href} ] }

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request, expected JSON {"message":"..."}']);
    exit;
}

$query = trim((string)$input['message']);
if ($query === '') {
    echo json_encode(['ok' => true, 'reply' => "Please type a message.", 'source' => 'local']);
    exit;
}

$repoRoot = realpath(__DIR__ . '/..');
if ($repoRoot === false) $repoRoot = __DIR__ . '/..';

// We'll use a small SQLite FTS index for better relevance. If not present we'll build it.
$dbPath = __DIR__ . '/search_index.sqlite';

function build_index($repoRoot, $dbPath) {
    // create or replace index
    if (file_exists($dbPath)) @unlink($dbPath);
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // enable WAL for concurrency
    $pdo->exec('PRAGMA journal_mode = WAL');
    // Create FTS5 virtual table
    $pdo->exec("CREATE VIRTUAL TABLE docs USING fts5(path UNINDEXED, content, links UNINDEXED, tokenize = 'porter');");

    // scan HTML files
    $files = glob($repoRoot . '/*.html');
    $extra = glob($repoRoot . '/**/*.html');
    foreach ($extra as $f) if (!in_array($f,$files)) $files[] = $f;

    $insert = $pdo->prepare('INSERT INTO docs(path, content, links) VALUES(:path, :content, :links)');
    foreach ($files as $file) {
        $html = @file_get_contents($file);
        if ($html === false) continue;
        $clean = preg_replace('#<script.*?>.*?</script>#is',' ',$html);
        $clean = preg_replace('#<style.*?>.*?</style>#is',' ',$clean);
        // extract text
        $text = trim(strip_tags($clean));
        $text = preg_replace('/\\s+/',' ', $text);
        // extract links as JSON
            $links = [];
        if (preg_match_all("/<a[^>]+href=[\"']?([^\"'>\s]+)[\"']?[^>]*>(.*?)<\/a>/is", $html, $m)) {
                for ($i=0;$i<count($m[1]);$i++){
                    $href = $m[1][$i]; $t = trim(strip_tags($m[2][$i]));
                    $links[] = ['href'=>$href, 'text'=>$t];
                }
            }
        $rel = ltrim(str_replace('\\\\','/', substr($file, strlen($repoRoot))), '/');
        $insert->execute([':path'=>'/'.$rel, ':content'=>$text, ':links'=>json_encode($links)]);
    }
}

// ensure index exists
if (!file_exists($dbPath)) {
    try { build_index($repoRoot, $dbPath); } catch (Exception $e) { /* fallback to linear search below */ }
}

// search using FTS if available
$results = [];
try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Use FTS5 match; escape query safely
    $q = trim(preg_replace('/[^a-z0-9 ]/i',' ',$query));
    if ($q === '') throw new Exception('empty');
    $stmt = $pdo->prepare("SELECT path, content, links, bm25(docs) as rank FROM docs WHERE docs MATCH :m ORDER BY rank LIMIT 8");
    $stmt->execute([':m'=>$q]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // helper to create a focused excerpt around the first match
    $make_excerpt = function($content, $queryText) {
        $len = 400;
        $low = mb_strtolower($content);
        $qwords = preg_split('/\s+/', trim(preg_replace('/[^a-z0-9 ]/i',' ',$queryText)));
        foreach ($qwords as $w) {
            if ($w === '') continue;
            $pos = mb_stripos($low, $w);
            if ($pos !== false) {
                $start = max(0, $pos - intval($len/2));
                $snippet = mb_substr($content, $start, $len);
                return (($start>0)?'... ':'') . trim($snippet) . ((mb_strlen($content) > $start + $len)?' ...':'' );
            }
        }
        // fallback start of doc
        return mb_substr($content, 0, 800);
    };

    foreach ($rows as $r) {
        $excerpt = $make_excerpt($r['content'], $query);
        $links = [];
        if ($r['links']) {
            $links = json_decode($r['links'], true) ?: [];
        }
        $results[] = ['path'=>$r['path'],'excerpt'=>$excerpt,'links'=>$links, '_query'=>$query];
    }

    // if FTS returned no rows, try a simple LIKE-based fallback to broaden matches
    if (empty($results)) {
        $likeFiles = [];
        $files = glob($repoRoot . '/*.html');
        $extra = glob($repoRoot . '/**/*.html'); foreach ($extra as $f) if (!in_array($f,$files)) $files[] = $f;
        foreach ($files as $file) {
            $html = @file_get_contents($file);
            if ($html === false) continue;
            $clean = preg_replace('#<script.*?>.*?</script>#is',' ',$html);
            $clean = preg_replace('#<style.*?>.*?</style>#is',' ',$clean);
            $text = trim(strip_tags($clean));
            if (stripos($text, $query) !== false) {
                $rel = ltrim(str_replace('\\','/', substr($file, strlen($repoRoot))), '/');
                $likeFiles[] = ['path'=>'/'.$rel, 'excerpt'=>mb_substr($text,0,800), 'links'=>[],'_query'=>$query];
            }
        }
        if (!empty($likeFiles)) {
            // merge a few results
            foreach (array_slice($likeFiles,0,6) as $lf) $results[] = $lf;
        }
    }
} catch (Exception $e) {
    // fallback: simple linear scan of HTML files
    $files = glob($repoRoot . '/*.html');
    $extra = glob($repoRoot . '/**/*.html'); foreach ($extra as $f) if (!in_array($f,$files)) $files[] = $f;
    foreach ($files as $file) {
        $html = @file_get_contents($file);
        if ($html === false) continue;
        $clean = preg_replace('#<script.*?>.*?</script>#is',' ',$html);
        $clean = preg_replace('#<style.*?>.*?</style>#is',' ',$clean);
        $text = trim(strip_tags($clean)); $low = strtolower($text); if (strpos($low, strtolower($query)) !== false) {
            $rel = ltrim(str_replace('\\\\','/', substr($file, strlen($repoRoot))), '/');
            $results[] = ['path'=>'/'.$rel,'excerpt'=>substr($text,0,800),'links'=>[]];
        }
    }
}

if (empty($results)) {
    // no matches - return helpful top pages and hint
    $common = [];
    $files = glob($repoRoot . '/*.html'); foreach ($files as $f) { $rel = ltrim(str_replace('\\','/', substr($f, strlen($repoRoot))), '/'); $common[]=['title'=>pathinfo($rel,PATHINFO_FILENAME),'href'=>'/'.$rel]; }
    $reply = "I couldn't find a close match for your question on the site. Try rephrasing or ask about a specific area (e.g. 'services', 'pricing'). Here are some pages you can check:";
    foreach (array_slice($common,0,6) as $c) $reply .= "\n- {$c['title']}: {$c['href']}";
    echo json_encode(['ok'=>true,'reply'=>$reply,'source'=>'local','links'=>array_slice($common,0,6),'_query'=>$query]);
    exit;
}

// By default return consolidated excerpts and suggested links
$replyParts = [];
$linksOut = [];
foreach (array_slice($results,0,4) as $r) {
    $replyParts[] = "Page: {$r['path']}\n" . $r['excerpt'];
    foreach (array_slice($r['links'],0,4) as $lk) {
        $href = $lk['href']; if (strpos($href,'http')!==0 && strpos($href,'/')!==0) { $href = dirname($r['path']) . '/' . ltrim($href,'./'); }
        $linksOut[] = ['title'=>$lk['text']?:$href, 'href'=>$href];
    }
}

// Optionally call an LLM to produce a natural answer constrained to these snippets
$llmApiKey = getenv('OPENAI_API_KEY') ?: null;
$useLLM = !empty($llmApiKey);
if ($useLLM) {
    // prepare context
    $context = "";
    foreach (array_slice($results,0,6) as $i=>$r) {
        $context .= "[DOC {$i}] Path: {$r['path']}\n" . $r['excerpt'] . "\n\n";
    }
    $prompt = "You are an assistant that must answer the user's question using ONLY the provided website passages. Do NOT use outside knowledge. If the answer cannot be found, reply with 'NOT_FOUND' and then ask a concise clarifying question. Include a SOURCES: section listing the document paths used.\n\nContext:\n" . $context . "\nUser question: {$query}\n\nAnswer:";

    // call OpenAI chat completion (gpt-3.5-turbo)
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    $payload = json_encode([
        'model'=>'gpt-3.5-turbo',
        'messages'=>[
            ['role'=>'system','content'=>"You are a helpful assistant that must answer using only the provided context."],
            ['role'=>'user','content'=>$prompt]
        ],
        'temperature'=>0.0,
        'max_tokens'=>512
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $llmApiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $res = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if ($res !== false && !$err) {
        $j = json_decode($res, true);
        if (isset($j['choices'][0]['message']['content'])) {
            $answer = $j['choices'][0]['message']['content'];
            // extract sources lines if present
            preg_match_all('/SOURCES?:\s*(.*)/i', $answer, $sm);
            $sources = [];
            if (!empty($sm[1])) {
                foreach ($sm[1] as $s) {
                    $sources[] = trim($s);
                }
            }
            // return LLM answer and site links
            echo json_encode(['ok'=>true,'reply'=>$answer,'source'=>'llm','links'=>array_slice($linksOut,0,6),'sources'=>$sources]);
            exit;
        }
    }
    // fall through to local-only reply if LLM failed
}

$reply = "I found the following excerpt(s) on the website that match your question:\n\n" . implode("\n\n", $replyParts);
// dedupe links
$seen = []; $uniq = [];
foreach ($linksOut as $l) { if (isset($seen[$l['href']])) continue; $seen[$l['href']]=true; $uniq[]=$l; }
echo json_encode(['ok'=>true,'reply'=>$reply,'source'=>'local','links'=>array_slice($uniq,0,6),'_query'=>$query]);
exit;
