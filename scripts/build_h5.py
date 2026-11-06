"""Build the browser H5 variant without modifying the submitted mini-tool bundle."""
from pathlib import Path
import shutil
import json
import hashlib
root = Path(__file__).resolve().parents[1]
out = root / 'h5'
out.mkdir(exist_ok=True)
for name in ['index.html', 'style.css', 'calc.js', 'guide.js', 'product-art.js']:
    shutil.copyfile(root / 'dist' / name, out / name)
source = (root / 'dist' / 'app.js').read_text()
source = source.replace("'wnf-v1'", "'wnf-h5-v1'")
source = source.replace("if(!api||typeof api.saveImageToPhotosAlbum!=='function'){toast('当前环境不支持存相册，请在小红书真机预览中使用。');return;}", "if(!api||typeof api.saveImageToPhotosAlbum!=='function'){await window.WNFWeb.saveImage(url);return;}")
source = source.replace("$('save-image').addEventListener", "$('save-image').textContent='分享 / 保存图片';$('save-image').addEventListener")
source = source.replace("数据仅保存在本机 · 不保证永久留存", "设置仅存当前浏览器 · 不上传工资数据")
source = source.replace("收入为估算 · 数据仅保存在本机", "收入为估算 · 数据仅存当前浏览器")
source = source.replace("if(state.reminderMode!=='text'&&api&&typeof api.vibrateShort==='function')api.vibrateShort({type:'light'}).catch(function(){});", "if(state.reminderMode!=='text'){if(api&&typeof api.vibrateShort==='function')api.vibrateShort({type:'light'}).catch(function(){});else if(typeof navigator.vibrate==='function')navigator.vibrate(35);}")
# A read-only bridge for the desktop browser view; dist stays untouched.
render_hook = 'renderIncomePeriod(v,s,now);checkMilestones(v,now);}'
assert source.count(render_hook) == 1, 'H5 floating render hook needs review'
source = source.replace(render_hook, 'renderIncomePeriod(v,s,now);checkMilestones(v,now);if(window.WNFFloating)window.WNFFloating.sync();}')
load_hook = 'load();\n})();'
assert source.count(load_hook) == 1, 'H5 floating state bridge needs review'
source = source.replace(load_hook, '''if(window.WNFFloating)window.WNFFloating.connect({
getSnapshot:function(){var result={configured:!!state.configured,demo:demo,masked:state.displayMode==='private'};if(!result.configured||demo)return result;var now=current(),s=settings(),v=C.balance(now,s,state.checkpoint);if(!result.masked)result.amount=v.today;else{var a=C.anchor(state.wishes,v.total,s.salary,state.anchorSelection,state.incomePeriod==='month'?'monthly':'daily',C.dailyTarget(now,s));result.goal={id:a.id,name:a.name,kind:a.kind,progress:a.progress,art:productSVG(a)};}return result;},
togglePrivacy:function(){$('view-toggle').click();},message:toast});
load();
})();''')
index = (out / 'index.html').read_text().replace('<title>窝囊费</title>', '<title>窝囊费 · 每一秒，都算数</title><meta name="description" content="按时间看见收入，用小目标点亮生活。支持金额与脱敏模式，工资数据仅保存在当前浏览器。"><meta name="theme-color" content="#f5f3ec"><link rel="icon" href="./icon.png">')
index = index.replace('<button id="offer-source">查看好价来源 ↗</button>', '<a id="offer-source" target="_blank" rel="noopener noreferrer">查看什么值得买 ↗</a>')
source = source.replace("function sourceMarkup(url,label){return '<p>来源地址供核对：</p><textarea class=\"source-url\" readonly aria-label=\"'+esc(label)+'来源地址\">'+esc(url)+'</textarea>';}", "function sourceMarkup(url,label){return '<a class=\"deal-source-link\" href=\"'+esc(url)+'\" target=\"_blank\" rel=\"noopener noreferrer\">在'+esc(label)+'查看参考价 ↗</a>';}")
(out / 'app.js').write_text(source)
index = index.replace('<script src="./app.js">', '<script src="./web.js"></script><script src="./floating.js"></script><script src="./app.js">')
index = index.replace('<footer id="privacy">', '<div id="floating-entry" class="floating-entry" hidden><button id="floating-open" type="button" hidden aria-pressed="false">悬浮小窗 ↗</button><p id="floating-note" hidden></p></div><footer id="privacy">')
version = json.loads((root / 'package.json').read_text())['version']
# Refresh browser assets after an H5-only change without bumping the mini-tool.
revision = hashlib.sha256((Path(__file__).read_text() + index + source +
                           (out / 'calc.js').read_text() + (out / 'style.css').read_text() +
                           (out / 'guide.js').read_text() + (out / 'product-art.js').read_text() +
                           (out / 'web.js').read_text() + (out / 'floating.js').read_text() +
                           (out / 'floating.css').read_text()).encode()).hexdigest()[:10]
version += '-' + revision
for asset in ['calc.js', 'product-art.js', 'guide.js', 'web.js', 'app.js', 'style.css', 'floating.js']:
    index = index.replace('./' + asset + '"', './' + asset + '?v=' + version + '"')
(out / 'index.html').write_text(index)
shutil.copyfile(root / 'assets' / 'icon.png', out / 'icon.png')
with (out / 'style.css').open('a') as f:
    f.write('''\n/* H5: no native mini-tool navigation bar to avoid. */
main{padding-top:28px;padding-top:calc(28px + env(safe-area-inset-top, 0px));padding-bottom:calc(18px + env(safe-area-inset-bottom, 0px))}
.overlay{padding-top:calc(20px + env(safe-area-inset-top, 0px));padding-bottom:calc(20px + env(safe-area-inset-bottom, 0px))}
@media(min-width:650px){body{background:#e9eddf}main{max-width:480px;background:#f5f3ec;box-shadow:0 0 70px #5366440b}.receipt{min-height:400px}}
.floating-entry{text-align:center;margin:0 0 14px}.floating-entry[hidden],.floating-entry [hidden]{display:none!important}
.floating-entry button{border:1px solid #dce3d1;background:transparent;color:#6e8060;font:inherit;font-size:12px;border-radius:20px;padding:8px 16px;cursor:pointer}
.floating-entry button:hover{background:#e5ebda}.floating-entry button:focus{outline:2px solid #8ca171;outline-offset:3px}
.floating-entry p{font-size:10px;color:#919b87;margin:8px 0 0}
@media(max-width:649px),(hover:none),(pointer:coarse){.floating-entry{display:none!important}}
''')
(out / '_headers').write_text('''/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
''')
print(out)
