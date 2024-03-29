const dodler = {
  state: {
    root: null,
    isOpen: false,
  },
  init(){
    this.viewService._addStyleSheet()

    this.state.root = this.viewService.createElement('div', document.body, {className:"dodler-root"});
    this.dataService.loadFromStorage();
    this._createToggleBtn(this.state.root)
    this._createContent(this.state.root)
    this.state.root.addEventListener("drag", ev=>{
      console.log(ev.x, ev.y);
    })

  },
  _createToggleBtn(root){
    const btnHolder = this.viewService.createElement('div', root, {className:"btnHolder"});
    const toggleBtn = this.viewService.createElement('button', btnHolder, {id:"toggleBtn"});

    toggleBtn.onclick = ()=>{
      root.style.width="auto";
      root.style.height="auto";

      const contentRoot = root.querySelector("#contentRoot")
      if(root.classList.contains('active')){
        contentRoot.style.width=0;
        contentRoot.style.height=0;
      }else{
        contentRoot.style.width="270px";
        this._setHeightByContent();
      }
      root.classList.toggle('active')
    }
  },
  _createContent(root){
    const contentRoot = this.viewService.createElement('div', root, {id:"contentRoot"});
    const mainInputHolder = this.viewService.createElement('div', contentRoot, {style: {padding:"6px"}});
    const textInput = this.viewService.createElement('input', mainInputHolder, {className:"text-box"});
    const submitBtn = this.viewService.createElement('button', mainInputHolder, {id:"submitBtn"});
    const textBtnHolder = this.viewService.createElement('div', contentRoot, {id:"textBtnHolder"});
    this.createTextBtns();

    textInput.addEventListener('change', event=>event.stopPropagation())
    this.previousActiveElement = null;

    submitBtn.onmousedown = ()=> {
      this.previousActiveElement = document.activeElement;
    };
    submitBtn.onclick = ()=>{

      const text = textInput.value;
      this.dataService.addItem(text);
      this.createTextBtns();

      if(this.state.root.contains(this.previousActiveElement)){
        return ;
      }
      this.textInputService.inputText(text, this.previousActiveElement);
    }
  },
  createTextBtns(){
    console.log(this.state);
    const textBtnHolder = this.state.root.querySelector("#textBtnHolder")

    textBtnHolder.innerHTML = "";
    for ( [idx, item] of this.dataService.getAllItems().entries()) {
      const btn = this.viewService.createElement('div', textBtnHolder, {className:"textBtn"});
      const label = this.viewService.createElement('span', btn, {innerHTML: item, data:{value: item, idx}});
      const delHldr = this.viewService.createElement('div', btn, {className: 'delete-holder'});
      const delBtn = this.viewService.createElement('div', delHldr, {className: 'delete', data:{value: idx}});

      label.onmousedown = ()=> {
        this.previousActiveElement = document.activeElement;
      };
      label.onclick = event=>{
        if(this.state.root.contains(this.previousActiveElement)){
          return ;
        }
        this.textInputService.inputText(event.target.dataset.value , this.previousActiveElement);
        this.dataService.prependWithIdx(event.target.dataset.idx)
        this.createTextBtns();
      }
      delBtn.onclick = event=>{
        this.deleteItem(event.target.dataset.value);
        event.stopPropagation()
      }

    }
  },
  _setHeightByContent(){
  },
  deleteItem(idx){
    this.dataService.deleteItem(idx);
    this.createTextBtns();
  },
  textInputService:{
    inputText(text, target){
      for (var char of text) {
        this.inputChar(char, target);
      }
      this.inputChar('Enter');
    },
    inputChar(char, target){
      if(target && target.tagName.toLowerCase() === 'input' ){
        target.value += char;
      }

      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: char,
      }));
    }
  },
  dataService:{
    items: [],
    loadFromStorage(){
      this.items = JSON.parse(localStorage.getItem('text-input-items')) ?? []

    },
    saveItemsToStorage(){
      localStorage.setItem('text-input-items', JSON.stringify(this.items))
    },
    addItem(item){
      if(this.items.includes(item)){
        return;
      }
      this.items.unshift(item)
      this.saveItemsToStorage()
    },
    deleteItem(idx){
      this.items.splice(idx,1);
      this.saveItemsToStorage()
    },
    getAllItems(){
      return this.items;
    },
    prependWithIdx(idx){
      let item = this.items.splice(idx,1);
      this.items.unshift(item);
    }
  },
  viewService:{
    createElement(tagName, parent, args={}){
      let el = document.createElement(tagName)
      Object.keys(args).forEach(key=>{
        if(key === 'style'){
          Object.keys(args.style).forEach(styleArg=>el.style[styleArg] = args.style[styleArg])
          return
        }
        if(key === 'data'){
          Object.keys(args.data).forEach(dataArg=>el.setAttribute(`data-${dataArg}`, args.data[dataArg]))
        }
        el[key] = args[key]
      })

      parent.appendChild(el)
      if(el.elements){
        el.elements.forEach(ch => {
          this.createElement(ch.tagName, ch.args, el)
        })
      }
      return el;
    },
    _addStyleSheet(){
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = `
      .dodler-root{
        position:fixed;
        top:20px;
        left:20px;
        background-color: #90edff36;
        z-index: 9999;
        border: 1px solid #029bc973;
        overflow:hidden;
        box-shadow: rgba(11, 80, 255, 0.2) 0px 7px 29px 0px;
        width:auto;
        height:auto;
        color:black;
        font-size: 20px;

      }
      .dodler-root.active{
        resize:both;
        box-shadow: rgba(11, 80, 255, 0.52) 0px 7px 29px 0px;
      }
      .dodler-root *::-webkit-scrollbar {
        width: 1em;
        cursor:pointer;
      }

      .dodler-root *::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      }
      .dodler-root *::-webkit-scrollbar-corner {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      }

      .dodler-root *::-webkit-scrollbar-thumb {
        background-color: darkgrey;
        outline: 1px solid slategrey;
      }
      .dodler-root ::placeholder{
        color:black;
      }
      .dodler-root #toggleBtn{
        background-color: #3b86947a;
      }
      .dodler-root #toggleBtn:before{
        content: url("data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M6 10H6.01M8 14H8.01M10 10H10.01M12 14H12.01M14 10H14.01M16 14H16.01M18 10H18.01M5.2 18H18.8C19.9201 18 20.4802 18 20.908 17.782C21.2843 17.5903 21.5903 17.2843 21.782 16.908C22 16.4802 22 15.9201 22 14.8V9.2C22 8.0799 22 7.51984 21.782 7.09202C21.5903 6.71569 21.2843 6.40973 20.908 6.21799C20.4802 6 19.9201 6 18.8 6H5.2C4.07989 6 3.51984 6 3.09202 6.21799C2.71569 6.40973 2.40973 6.71569 2.21799 7.09202C2 7.51984 2 8.07989 2 9.2V14.8C2 15.9201 2 16.4802 2.21799 16.908C2.40973 17.2843 2.71569 17.5903 3.09202 17.782C3.51984 18 4.0799 18 5.2 18Z' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
      }
      .dodler-root.active #toggleBtn{
        background-color: #7b202d;
      }
      .dodler-root.active #toggleBtn:before{
        content: "❌"
      }
      .dodler-root #contentRoot{
        height:0;
        width:0;
        transition:width 0.6s, height 0.4s;
        padding:0 6px;
      }
      .dodler-root.active #contentRoot{
        min-height:270px;
        max-height:800px;
        display: flex;
        flex-direction:column;
      }
      .dodler-root .text-box{
        background-color: #02c0c9a3;
        font-size: 24px;
        margin: 2px 1px;
        color: black;
        width: 75%;
      }
      .dodler-root .textBtn{
        background-color: #8b8a8a;
        margin:2px;
        cursor: pointer;
        font-family:monospace;
        display:flex;
      }
      .dodler-root .textBtn span{
        padding:4px 6px;
      }
      .dodler-root .textBtn:hover{
        background-color: #6f7c65;
      }
      .dodler-root .textBtn:active{
        background-color: #8ca080;
      }
      .dodler-root .textBtn:before{
        content:attr(data-value);
      }
      .dodler-root .textBtn .delete-holder{
        padding-right: 2px;
        padding-top: 4px;
        border-right: 12px #823a3a solid;
      }
      .dodler-root .textBtn .delete-holder:hover{
        border:none;
        background-color:#cf1111;
      }
      .dodler-root .textBtn .delete-holder:active{
        border:none;
        background-color:#fa1d1d;;
      }
      .dodler-root .textBtn .delete-holder .delete{
        visibility:hidden;
      }
      .dodler-root .textBtn .delete-holder:hover .delete{
        visibility:visible;
        content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='22px' height='22px'%3E%3Cpath d='M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z'/%3E%3C/svg%3E");
      }

      .btnHolder{
        display:flex;
        justify-content:end;
      }
      .dodler-root #submitBtn:before{
        content: url("data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M10.5004 11.9998H5.00043M4.91577 12.2913L2.58085 19.266C2.39742 19.8139 2.3057 20.0879 2.37152 20.2566C2.42868 20.4031 2.55144 20.5142 2.70292 20.5565C2.87736 20.6052 3.14083 20.4866 3.66776 20.2495L20.3792 12.7293C20.8936 12.4979 21.1507 12.3822 21.2302 12.2214C21.2993 12.0817 21.2993 11.9179 21.2302 11.7782C21.1507 11.6174 20.8936 11.5017 20.3792 11.2703L3.66193 3.74751C3.13659 3.51111 2.87392 3.39291 2.69966 3.4414C2.54832 3.48351 2.42556 3.59429 2.36821 3.74054C2.30216 3.90893 2.3929 4.18231 2.57437 4.72906L4.91642 11.7853C4.94759 11.8792 4.96317 11.9262 4.96933 11.9742C4.97479 12.0168 4.97473 12.0599 4.96916 12.1025C4.96289 12.1506 4.94718 12.1975 4.91577 12.2913Z' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
      }
      .dodler-root #submitBtn.locked{
        background-color:  #b1ff44
      }
      .dodler-root #textBtnHolder{
        margin: 12px;
        padding: 8px 12px;
        background-color: #0000ff24;
        display:flex;
        flex-wrap: wrap;
        max-height: 200px;
        overflow-y: scroll;
      }
      `;
      document.getElementsByTagName('head')[0].appendChild(style);
    }
  },

}
dodler.init()
