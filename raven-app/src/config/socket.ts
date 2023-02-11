import { io } from 'socket.io-client'

let socket_port = import.meta.env.VITE_SOCKET_PORT ?? "9002"
let host = window.location.hostname;
let port = window.location.port ? `:${socket_port}` : '';
let protocol = port ? 'http' : 'https';
let url = `${protocol}://${host}${port}`;
let socket = io(url, { withCredentials: true })

export default socket;