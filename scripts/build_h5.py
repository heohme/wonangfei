"""Build the browser H5 variant without modifying the submitted mini-tool bundle."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
out = root / 'h5'
out.mkdir(exist_ok=True)
for name in ['index.html', 'style.css', 'calc.js']:
    shutil.copyfile(root / 'dist' / name, out / name)
source = (root / 'dist' / 'app.js').read_text()
source = source.replace("'wnf-v1'", "'wnf-h5-v1'")
source = source.replace("if(!api||typeof api.saveImageToPhotosAlbum!=='function'){toast('当前环境不支持存相册，请在小红书真机预览中使用。');return;}", "if(!api||typeof api.saveImageToPhotosAlbum!=='function'){await window.WNFWeb.saveImage(url);return;}")
source = source.replace("$('save-image').addEventListener", "$('save-image').textContent='分享 / 保存图片';$('save-image').addEventListener")
source = source.replace("数据仅保存在本机 · 不保证永久留存", "设置仅存当前浏览器 · 不上传工资数据")
source = source.replace("收入为估算 · 数据仅保存在本机", "收入为估算 · 数据仅存当前浏览器")
source = source.replace("if(state.reminderMode!=='text'&&api&&typeof api.vibrateShort==='function')api.vibrateShort({type:'light'}).catch(function(){});", "if(state.reminderMode!=='text'){if(api&&typeof api.vibrateShort==='function')api.vibrateShort({type:'light'}).catch(function(){});else if(typeof navigator.vibrate==='function')navigator.vibrate(35);}")
(out / 'app.js').write_text(source)
index = (out / 'index.html').read_text().replace('<title>窝囊费</title>', '<title>窝囊费 · 每一秒，都算数</title><meta name="description" content="按时间看见收入，用小目标点亮生活。支持金额与脱敏模式，工资数据仅保存在当前浏览器。"><meta name="theme-color" content="#f5f3ec"><link rel="icon" href="./icon.png">')
index = index.replace('<script src="./app.js">', '<script src="./web.js"></script><script src="./app.js">')
(out / 'index.html').write_text(index)
shutil.copyfile(root / 'assets' / 'icon.png', out / 'icon.png')
with (out / 'style.css').open('a') as f:
    f.write('''\n/* H5: no native mini-tool navigation bar to avoid. */
main{padding-top:28px;padding-top:calc(28px + env(safe-area-inset-top, 0px));padding-bottom:calc(18px + env(safe-area-inset-bottom, 0px))}
.overlay{padding-top:calc(20px + env(safe-area-inset-top, 0px));padding-bottom:calc(20px + env(safe-area-inset-bottom, 0px))}
@media(min-width:650px){body{background:#e9eddf}main{max-width:480px;background:#f5f3ec;box-shadow:0 0 70px #5366440b}.receipt{min-height:400px}}
''')
(out / '_headers').write_text('''/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
''')
print(out)
