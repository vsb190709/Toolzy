import {style,qs,copy} from './helpers.js';
const emojis='😀 😃 😄 😁 😆 😅 😂 🙂 🙃 😉 😊 😎 🤓 🤩 🥳 😴 🤔 😮 😱 😭 😡 👍 👎 👌 ✌️ 🤞 🤟 🤘 👋 🙌 👏 💪 🫶 🙏 💡 🔥 ⭐ 🎯 🚀 💻 📱 🎧 🎮 📚 ✏️ 🔒 🔑 ⏰ 🍕 🍔 🍟 🌮 🍜 🍎 🍌 🍉 🍪 🍫 ☕ 🌈 ☀️ 🌙 🌸 🌻 🌳 🍀 🌊 ❄️ ⚡ ❤️ 💯 ✅ ❌ ⚠️ ❓ ❗ ➕ ➖ ➡️ 🔗'.split(' ');
export function mount(root){
 style();
 root.innerHTML='<section class="ut-page"><div class="ut-card"><div class="ut-head"><div class="ut-head-icon">emoji_emotions</div><div><h2>Emoji Picker</h2><p>Search and copy emojis quickly.</p></div></div><label class="ut-field"><span>Search</span><input data-search placeholder="type a symbol name or browse"></label><div class="ut-color-row" data-out></div><div class="ut-output" data-picked>Select an emoji.</div><div class="ut-actions"><button data-copy>Copy selected</button></div></div></section>';
 let selected='';
 function draw(){qs(root,'[data-out]').innerHTML=emojis.map((e,i)=>'<button class="ut-color-chip" style="font-size:28px;background:var(--surface-2)" title="Emoji '+(i+1)+'" data-e="'+e+'">'+e+'</button>').join('');root.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{selected=b.dataset.e;qs(root,'[data-picked]').textContent='Selected: '+selected})}
 qs(root,'[data-search]').oninput=draw;qs(root,'[data-copy]').onclick=()=>copy(selected);draw();
}