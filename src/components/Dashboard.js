import React, { useRef } from 'react';
import './dashboard.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

function GlobalChat(props) {
    const messagesEndRef = useRef(null);
    const [input_val, setInput_val] = useState('');
    const socketRef = props.soc;
    let messages = props.msgs;
    let active = props.act;

    const inputChange = (event) => {
        setInput_val(event.target.value);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessages = () => {
        if (input_val !== '') {
            socketRef.current.emit("global_chat", input_val);
            setInput_val('');
        }
    };

    return (
        <>
            <div className='frame'>
                <div className="backbutton">
                    <button className="back" onClick={props.closewindow}>{"<--"}</button>
                    Global Chat ● {active}
                </div>
                <div className="cont">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <strong>{msg.user}:</strong> {msg.msg}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="inputfields">
                    <input
                        type="text"
                        placeholder='Type..'
                        value={input_val}
                        onChange={inputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                sendMessages();
                            }
                        }}
                    />
                    <button onClick={sendMessages}>Send</button>
                </div>
            </div>
        </>
    );
}

function RoomChat(props) {
    const messagesEndRef = useRef(null);
    const [input_val, setInput_val] = useState('');
    const roomMessages = props.msgs
    const socketRef = props.soc;
    const room = props.room;
    const username = props.username;
  


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [roomMessages]);

    const sendMessage = () => {
        if (input_val.trim() === '') return;

        console.log('Sending room chat:', { room, user: username, message: input_val });

        socketRef.current.emit('room_chat', {
            room: room,
            user: username,
            message: input_val
        });

        setInput_val('');
    };

    return (
        <div className="room-chat-container">
            <div className="room-chat-header">
                <h3>Room Chat</h3>
                <button className="close-chat" onClick={props.onClose}>×</button>
            </div>
            
            <div className="room-chat-messages">
                {roomMessages.map((msg, index) => (
                    <div key={index} className={`room-message ${msg.user === username ? 'own-message' : ''}`}>
                        <strong>{msg.user}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="room-chat-input">
                <input
                    type="text"
                    placeholder="Type your guess..."
                    value={input_val}
                    onChange={(e) => setInput_val(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}


function InitializeGame(props) {
    const [isHost, setIsHost] = useState(false);
    const [joining, setJoining] = useState(false);
    const socket = props.soc;
    const messages = Array.isArray(props.msg) ? props.msg : [];
    const username = props.username;


    const getRoom = () => {
        socket.current.emit('request_room');
        setIsHost(true);
        setJoining(false);
    };

    const leaveRoom = () => {
        socket.current.emit('leave', props.room);
        setJoining(false);
        setIsHost(false);
    };

    const joinRoom = () => {
        let roomCode = prompt("Enter the room code");
        if (roomCode && roomCode.trim()) {
            socket.current.emit('join', roomCode);
            setJoining(true);
            setIsHost(false);
        }
    };

    const startGame = () => {
        socket.current.emit('start', props.room);
    };

    useEffect(() => {
        if (!socket.current) return;

        const handleInvalidRoom = (msg) => alert(msg);
        const handleGameStarted = (msg) => alert(msg);

        socket.current.on('invalid_roomId', handleInvalidRoom);
        socket.current.on('gameStarted', handleGameStarted);


        return () => {
            socket.current.off('invalid_roomId', handleInvalidRoom);
            socket.current.off('gameStarted', handleGameStarted);
        };
    }, [socket]);

    return (
        <>
            <div className="buttons">
            <h3>Welcome {username}</h3>
                {isHost && !joining ? (
                    <div className="room-container">
                        <div className="backbtn">
                            <button onClick={leaveRoom}>{"<--"}</button>
                        </div>
                        <h2>Room Code: {props.room}</h2>
                        <button className="start" onClick={startGame}>Start Game</button>
                        

                        <div className="system-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="system-message">
                                     {msg}
                                </div>
                            ))}
                        </div>

                     
                    </div>
                ) : (
                    <div>
                        <button className="host" onClick={getRoom}>Create Room</button>
                    </div>
                )}

                {joining && !isHost ? (
                    <div className="room-container">
                        <button className="join_backbtn" onClick={leaveRoom}>{"<---"}</button>
                        <h2>Room Code: {props.room}</h2>
                        
                        <div className="system-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="system-message">
                                     {msg}
                                </div>
                            ))}
                        </div>

                        
                    </div>
                ) : (
                    <div>
                        <button className="player" onClick={joinRoom}>Join Room</button>
                    </div>
                )}
            </div>
        </>
    );
}

function DrawingBoard(props) {
    const canvasRef = useRef(null)
    const contextRef = useRef(null) 
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(5)
    const [showRoomChat, setShowRoomChat] = useState(false)
    const [rmsg, setRmsg] = useState([])
    let host = props.ishost;
    let drawer = props.drawer
    let word = props.word
    const socket = props.soc
    const username = props.username

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;
        
        canvas.width = 800
        canvas.height = 500
        
        const ctx = canvas.getContext('2d')
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        contextRef.current = ctx
        const handleDrawing = (data) => {
            console.log('Received drawing from others')
            if (!contextRef.current) return;
            
            contextRef.current.beginPath();
            contextRef.current.moveTo(data.prevX, data.prevY);
            contextRef.current.lineTo(data.currentX, data.currentY);
            contextRef.current.strokeStyle = data.color;
            contextRef.current.lineWidth = data.brushSize;
            contextRef.current.stroke();
            contextRef.current.closePath();
        }
        
        const handleClear = () => {
            if (!contextRef.current || !canvas) return;
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height)
            contextRef.current.fillStyle = 'white'
            contextRef.current.fillRect(0, 0, canvas.width, canvas.height)
        }

        socket.current.on('invalid_roomId', (data)=>{
            alert(data)
        })
        socket.current.on('gameStarted', (data)=>{
            alert(data)
        })

        socket.current.on('drawing', handleDrawing)
        socket.current.on('clear', handleClear)
        socket.current.on('room_chat', (data)=>{
            setRmsg(prev => [...prev, data])
        });

        socket.current.on('user_left',(data)=>{
            setRmsg(prev => [...prev, data])
        } );

        return () => {
            socket.current.off('drawing', handleDrawing)
            socket.current.off('clear', handleClear)
            socket.current.off('room_chat',)
            socket.current.off('user_left')
        }
    }, [])

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color
            contextRef.current.lineWidth = brushSize
        }
    }, [color, brushSize])

    const startDrawing = (e) => {
        if (!host || !contextRef.current) return
        
        const { offsetX, offsetY } = e.nativeEvent
        
        contextRef.current.beginPath()
        contextRef.current.moveTo(offsetX, offsetY)
        setIsDrawing(true)
    }

    const draw = (e) => {
        if (!isDrawing || !contextRef.current || !host) return;
        
        const { offsetX, offsetY } = e.nativeEvent;
        
        contextRef.current.lineTo(offsetX, offsetY)
        contextRef.current.stroke()
        
        socket.current.emit('drawing', {
            room: props.room,
            prevX: offsetX - e.movementX,
            prevY: offsetY - e.movementY,
            currentX: offsetX,
            currentY: offsetY,
            color: color,
            brushSize: brushSize
        });
    }

    const stopDrawing = () => {
        if (!contextRef.current) return;
        setIsDrawing(false);
        contextRef.current.closePath();
    }

    const clearBoard = () => {
        if (!contextRef.current || !canvasRef.current) return;
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.fillStyle = 'white'
        contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        socket.current.emit('clear_board', props.room);
    }

    return (
        <div className="drawing-board-container">
            <button onClick={()=>{socket.current.emit('leave',props.room)}}>Leave Room</button>
            <div className="drawing_board">
                {host && (
                    <div className="drawingtools">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={e => setColor(e.target.value)} 
                        />
                        <input 
                            type="range" 
                            min={1} 
                            max={20} 
                            value={brushSize} 
                            onChange={(e) => setBrushSize(e.target.value)} 
                        />
                        <button onClick={clearBoard}>Clear Board</button>
                        <h4>Word: {word}</h4>
                    </div>
                )}
                
                <canvas
                    ref={canvasRef}
                    onMouseDown={host ? startDrawing : undefined}
                    onMouseMove={host ? draw : undefined}
                    onMouseUp={host ? stopDrawing : undefined}
                    onMouseLeave={host ? stopDrawing : undefined}
                    style={{ 
                        border: '2px solid #333',
                        cursor: host ? 'crosshair' : 'default',
                        width: '800px',
                        height: '500px',
                        backgroundColor: 'white',
                        borderRadius: '4px'
                    }}
                />
                
                {!host && (
                    <div className="guesser-hint">
                        <p>Watching {drawer} draw... Use chat to guess!</p>
                    </div>
                )}

           
                <button 
                    className="room-chat-toggle drawing-chat-toggle"
                    onClick={() => setShowRoomChat(!showRoomChat)}
                >
                {showRoomChat ? 'Hide Chat' : 'Show Chat'}
                </button>
            </div>

    
            {showRoomChat && (
                <div className="room-chat-popup drawing-chat">
                    <RoomChat
                        soc={socket}
                        room={props.room}
                        username={username}
                        msgs ={rmsg}
                        onClose={() => setShowRoomChat(false)}
                    />
                </div>
            )}
        </div>
    )
}

function Dashboard() {
    const [chatwindow, setChatwindow] = useState(false);
    const socketRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [room_msgs, setRoom_msgs] = useState([]);
    const [active, setActive] = useState(0);
    const [room, setRoom] = useState('');
    const [isStart, setIsStart] = useState(false)
    const [drawer, setDrawer] = useState('')
    const [isHost, setIsHost] = useState(false)
    const [word, setWord] = useState('')
    const [username, setUsername] = useState('')

    useEffect(() => {
        const socket = io('https://drawgame-backend.onrender.com', {
            auth: {
                token: localStorage.getItem('access_token')
            }
        });
        socketRef.current = socket;
        socket.emit('requestActiveUsers');
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                setUsername(payload.Username || 'User');
            } catch (e) {
                setUsername('User');
            }
        }

        socket.on('global_chat', (data) => {
            setMessages(prev => [...prev, data]);
        });

        socket.on('get_room', (room) => {
            setRoom(room);
            socket.emit('join', room);
        });
        socket.on("joined_room", (room)=>{
            setRoom(room);
        })

        socket.on('user_joined', (data) => {
            setRoom_msgs(prev => [...prev, data.msg]);
        });

        socket.on('start', (data) => {
            setIsStart(data.start)
            setDrawer(data.drawer)
        })

        socket.on('user_left', (data) => {
            setRoom_msgs(prev => [...prev, data.msg]);
        });

        socket.on('youHost', (data) => {
            setIsHost(data.youreHost)
            console.log('working')
            setWord(data.word)
        })

        socket.on('roomLeft', (data)=>{
            if (room===data){
                setRoom('')
            }
            setIsStart(false)
            setIsHost(false)
        })

        socket.on('activeUsers', (e) => {
            setActive(e);
        });
        socket.on('notEnoughPlayers', (data) => {
            alert(data.message)
        })

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <>
            {isStart ? (
                <DrawingBoard 
                    ishost={isHost} 
                    word={word} 
                    drawer={drawer} 
                    soc={socketRef} 
                    room={room} 
                    username={username}
                />
            ) : (
                <> 
                    {chatwindow && (
                        <div className='glob'>
                            <GlobalChat
                                closewindow={() => setChatwindow(false)}
                                soc={socketRef}
                                msgs={messages}
                                act={active}
                            />
                        </div>
                    )}

                    <InitializeGame
                        soc={socketRef}
                        room={room}
                        msg={room_msgs}
                        username={username}
                    />

                    <div className="globalchatbutton" onClick={() => setChatwindow(true)}>
                        Chat
                    </div>
                </>
            )}
        </>
    );
}

export default Dashboard;
