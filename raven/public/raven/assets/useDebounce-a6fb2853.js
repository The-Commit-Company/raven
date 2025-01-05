import{r as o}from"./index-46d9a48d.js";const n=(e,t=200)=>{const[r,s]=o.useState(e);return o.useEffect(()=>{const u=setTimeout(()=>{s(e)},t);return()=>{clearTimeout(u)}},[e,t]),r};export{n as u};
