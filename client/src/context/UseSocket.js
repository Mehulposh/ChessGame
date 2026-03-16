import { useContext } from 'react';
import SocketContext  from './SocketInstance.js';

const useSocket = () => useContext(SocketContext);

export default useSocket;