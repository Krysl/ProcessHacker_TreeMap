import{c as b,s as S,m as k,f as M,i as N,h as F,a as x,g as I}from"./vendor.1e24b5dd.js";const U=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const e of r.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&l(e)}).observe(document,{childList:!0,subtree:!0});function s(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerpolicy&&(r.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?r.credentials="include":n.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(n){if(n.ep)return;n.ep=!0;const r=s(n);fetch(n.href,r)}};U();function y(t){const o=t.indexOf('"'),s=b(t.slice(o)),l=t.slice(0,o-2);console.log(l);let n={name:"/",description:l,index:-1,depth:-1,children:[]},r=-1,e=n,i=n,a=[];for(let f=0;f<s.length;f++){const h=s[f];let p=h.Name;const j=p.length;p=p.trim();const c=(j-p.length)/2;let T="";const d=h["Private bytes"];let m=0;d.includes("kB")?m=parseFloat(d)*1e3:d.includes("MB")?m=parseFloat(d)*1e3*1e3:d.includes("GB")&&(m=parseFloat(d)*1e3*1e3*1e3);const g={name:p.replace(".exe",""),value:m,description:h.Description,commandLine:h["Command line"],index:f,depth:c,children:null};if(c>r){const u={name:i.name,value:i.value,description:i.description,commandLine:i.commandLine,index:i.index+.5,depth:i.depth+1,children:null};i.name+="+...",i.value=0,i.children=[u],e=i,e.children.push(g),a.push(e)}else if(c==r)e.children.push(g);else if(c<r){let u=r-c;for(;u--;)a.pop();e=a[a.length-1],e.children.push(g)}r=c,i=g;for(const u of a)T+=u.name+"/"}return console.log(n),n}let C=0;function v(t){return new w("O-"+(t==null?"":t+"-")+ ++C)}function w(t){this.id=t,this.href=new URL(`#${t}`,location)+""}w.prototype.toString=function(){return"url("+this.href+")"};function B(t){let o="";const s=1e3*1e3*1e3,l=1e3*1e3,n=1e3;return t>s?o=`${t/s} GB`:t>l?o=`${t/l} MB`:t>n?o=`${t/n} kB`:o=`${t} B`,o}const $=document.body.clientHeight-23,L=document.body.clientWidth,E=S([8,0],k);M(",d");const G=t=>N().size([L,$]).paddingOuter(3).paddingTop(19).paddingInner(1).round(!0)(F(t).sum(o=>o.value).sort((o,s)=>s.value-o.value));function A(t){const o=G(t),s=v("shadow"),l=x("#d3-output-svg");l&&l.remove();const n=x("#d3-output").append("svg").attr("id","d3-output-svg").attr("viewBox",[0,0,L,$]).style("font","10px sans-serif");n.append("filter").attr("id",s.id).append("feDropShadow").attr("flood-opacity",.3).attr("dx",0).attr("stdDeviation",3);const r=n.selectAll("g").data(I(o,e=>e.depth)).join("g").selectAll("g").data(e=>e[1]).join("g").attr("transform",e=>`translate(${e.x0},${e.y0})`);return r.append("title").text(e=>`${e.ancestors().reverse().map(i=>i.data.name).join("/")}
${B(e.value)}
${e.data.index}
${e.data.commandLine}`),r.append("rect").attr("id",e=>(e.nodeUid=v("node")).id).attr("fill",e=>E(e.height)).attr("width",e=>e.x1-e.x0).attr("height",e=>e.y1-e.y0),r.append("clipPath").attr("id",e=>(e.clipUid=v("clip")).id).append("use").attr("xlink:href",e=>e.nodeUid.href),r.append("text").attr("clip-path",e=>e.clipUid).selectAll("tspan").data(e=>e.data.name.split(/(?=[A-Z][^A-Z])/g).concat(B(e.value)).concat(e.data.description)).join("tspan").text(e=>e),r.filter(e=>e.children).selectAll("tspan").attr("dx",3).attr("y",13),r.filter(e=>!e.children).selectAll("tspan").attr("x",3).attr("y",(e,i,a)=>`${(i===a.length-1)*.3+1.1+i}em`),n.node(),n.node()}function H(t){const o=document.createElement("P");return o.innerText=t,o.setAttribute("style","font-weight: bold;"),o}const O=H(`The following is for demonstration, please upload the "Process Hacker Processes.csv" file to show your own memory usage's TeeeMap`),P=document.getElementById("inputfile");P.addEventListener("change",function(){var t=new FileReader;t.onload=function(){const o=y(t.result);O.innerText=o.description.split(`\r
`).join(", "),A(o)},t.readAsText(this.files[0])});P.parentNode.appendChild(O);fetch("Process Hacker Processes.csv").then(function(t){return t.text()}).then(function(t){const o=y(t);A(o)});