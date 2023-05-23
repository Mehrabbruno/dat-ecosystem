(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const navbar = require('../src/node_module/navbar/index.js')

const title = document.createElement('h1')
title.innerHTML = 'Icon button'
const navbar_component = navbar()

const main = document.createElement('div')


// Setting padding and margin to 0px
document.documentElement.style.margin = `0`
document.documentElement.style.padding = `0`
document.body.style.margin = `0`
document.body.style.padding = `0`

main.append(navbar_component)
document.body.append(main)

},{"../src/node_module/navbar/index.js":3}],2:[function(require,module,exports){
module.exports = {
    icon_button: icon_button,
    text_button: text_button,
    logo_button: logo_button
}



// Text Button Component
// Props - icon/img src
function icon_button(props){

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

    const { src } = props

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const icon_button = document.createElement('div')
    icon_button.classList.add('icon_btn')
    
    const icon = document.createElement('img')
    icon.src = src
    icon_button.append(icon)

    icon_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(icon_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

    function get_theme(){
        return`
            :host{ 
                --white: white;
                --ac-1: #2ACA4B;
                --ac-2: #F9A5E4;
                --ac-3: #88559D;
                --ac-4: #293648;
            }
            .icon_btn{
                display:flex;
                justify-content: center;
                align-items:center;
                height:40px;
                box-sizing:border-box;
                aspect-ratio:1/1;
                cursor:pointer;
                border: 1px solid var(--ac-4);
                background-color: var(--white);
            }
            .icon_btn img{
                pointer-events:none;
            }
            .icon_btn.active{
                background-color: var(--ac-2)
            }
        `
    }

}



// Text Button Component
// Props - name
function text_button(props){

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const text_button = document.createElement('div')
    text_button.classList.add('text_button')
    text_button.innerHTML = props.text
    text_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(text_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

    function get_theme(){
        return`
            :host{ 
                --white: white;
                --ac-1: #2ACA4B;
                --ac-2: #F9A5E4;
                --ac-3: #88559D;
                --ac-4: #293648;
            }
            .text_button{
                text-align:center;
                font-size: 0.875em;
                line-height: 1.5714285714285714em;
                padding:10px 5px;
                height:40px;
                box-sizing:border-box;
                width: 100%;
                cursor:pointer;
                border: 1px solid var(--ac-4);
                background-color: var(--white);
                color:var(--ac-4);
            }
            .text_button.active{
                background-color: var(--ac-1);
                color: var(--ac-4);
            }
        `
    }

}


// Logo Button Component
function logo_button(){
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const logo_button = document.createElement('div')
    logo_button.classList.add('logo_button')


    const logo = document.createElement('img')
    logo.src = 'terminal_icon.png'
    const company_name = document.createElement('span')
    company_name.innerHTML = 'DAT ECOSYSTEM'
    logo_button.append(logo, company_name)


    logo_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(logo_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

    function get_theme(){
        return`
            :host{ 
                --white: white;
                --ac-1: #2ACA4B;
                --ac-2: #F9A5E4;
                --ac-3: #88559D;
                --ac-4: #293648;
            }
            .logo_button{
                width: 100%;
                height:40px;
                box-sizing:border-box;
                padding: 10px;
                display:flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                background-color: var(--ac-4);
                color: var(--white);
                font-size: 0.875em;
                letter-spacing: 0.25rem;
            }
        `
    }
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],3:[function(require,module,exports){
module.exports = navbar

// const icon_button = require('..')
const buttons = require('../buttons/index.js')

function navbar(){
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const navbar = document.createElement('div')
    navbar.classList.add('navbar')

    shadow.innerHTML = `
    <div class="navbar_wrapper">
        <div class="navbar">
            <div class="nav_toggle_wrapper"></div>
            <div class="page_btns_wrapper"></div>
            <div class="icon_btn_wrapper"></div>
        </div>
    </div>
    <style>${get_theme()}</style>
  `



    // Nav Toggle Buttons
    const consortium_btn = buttons.icon_button({src:'terminal_icon.png'})
    const logo_btn = buttons.logo_button()
    logo_btn.classList.add('logo_btn')
    const filter_btn = buttons.icon_button({src:'terminal_icon.png'})
    filter_btn.classList.add('filter_btn')

    const nav_toggle_wrapper = shadow.querySelector('.nav_toggle_wrapper');
    nav_toggle_wrapper.append(consortium_btn, logo_btn, filter_btn);





    // Page List Buttons
    const text_btns = [
        { text: 'HOME', element: buttons.text_button({ text: 'HOME' }) },
        { text: 'PROJECTS', element: buttons.text_button({ text: 'PROJECTS' }) },
        { text: 'GROWTH PROGRAM', element: buttons.text_button({ text: 'GROWTH PROGRAM' }) },
        { text: 'TIMELINE', element: buttons.text_button({ text: 'TIMELINE' }) }
    ]; 
    for (const button_data of text_btns) {
        const { element } = button_data;
        element.classList.add('text_button');
    }
    const page_btns_wrapper = shadow.querySelector('.page_btns_wrapper');
    page_btns_wrapper.append(...text_btns.map(button_data => button_data.element));





    // Adding social and action buttons
    const icon_btns = [
        { src: 'terminal_icon.png', element: buttons.icon_button({ src: 'terminal_icon.png' }) },
        { src: 'terminal_icon.png', element: buttons.icon_button({ src: 'terminal_icon.png' }) },
        { src: 'terminal_icon.png', element: buttons.icon_button({ src: 'terminal_icon.png' }) },
        { src: 'terminal_icon.png', element: buttons.icon_button({ src: 'terminal_icon.png' }) },
        { src: 'terminal_icon.png', element: buttons.icon_button({ src: 'terminal_icon.png' }) },
        { src: 'terminal_icon.png', element: buttons.icon_button({ src: 'terminal_icon.png' }) }
    ]; 
    for (const button_data of icon_btns) {
        const { element } = button_data;
        element.classList.add('icon_btn');
    }
    const icon_btn_wrapper = shadow.querySelector('.icon_btn_wrapper');
    icon_btn_wrapper.append(...icon_btns.map(button_data => button_data.element));





    // shadow.append(navbar)
    shadow.adoptedStyleSheets = [sheet]
    return el

    function get_theme(){
        return`
            :host{ 
                --white: white;
                --ac-1: #2ACA4B;
                --ac-2: #F9A5E4;
                --ac-3: #88559D;
                --ac-4: #293648;
            }
            .navbar_wrapper{
                container-type: inline-size;
            }
            .navbar{
                display: block;
                width:100%;
                height:40px;
                overflow:hidden;
                border-bottom: 1px solid var(--ac-4);

                // background-color: #EEECE9;
                // opacity: 0.8;
                // background: repeating-linear-gradient( -45deg, #777674, #777674 9px, #EEECE9 9px, #EEECE9 45px );

                --s: 20px; /* control the size */
                --_g: #EEECE9 /* first color */ 0 25%, #0000 0 50%;
                background:
                    repeating-conic-gradient(at 33% 33%,var(--_g)),
                    repeating-conic-gradient(at 66% 66%,var(--_g)),
                    #777674;  /* second color */ 
                background-size: var(--s) var(--s);                   
            }
            .navbar.active{
                height:max-content;
            }


            /* Starting buttons wrapper */
            .nav_toggle_wrapper{
                display: flex;
                width:100%;
                justify-content:stretch;
            }
            .nav_toggle_wrapper .logo_btn{
                width:100% !important;
                flex-grow:1;
            }
            .page_btns_wrapper{
                width:100%;
                display:flex;
                flex-direction:column;
            }
            .page_btns_wrapper .text_button{
                width:100%;
                flex-grow:1;
            }
            .icon_btn_wrapper{
                display:flex;
                justify-content:flex-start;
                // grid-template-columns: repeat(6, 2fr)
            }










            .page_list{
                display: none;
            }

            @container(min-width: 856px) {

                .navbar{
                    display: flex;
                }

                .nav_toggle_wrapper{
                    width:max-content;
                    display:flex;
                }
                .nav_toggle_wrapper .logo_btn{
                    width: max-content !important;
                }
                .page_list{
                    display:flex;
                }

                .nav_toggle_wrapper .filter_btn{
                    display: none;
                }
                .page_btns_wrapper{
                    flex-direction: row;
                }
                .page_btns_wrapper .text_button{
                    width:max-content !important;
                    flex-grow: unset;
                }
            }
            
            .socials_list{
                display: flex;
            }
        `
    }
}
},{"../buttons/index.js":2}]},{},[1]);
