body { margin: 0; background: #111; color: white; font-family: Arial; }
.header-ui { padding: 10px; background: #222; display: flex; gap: 20px; justify-content: center; }

.main-container { 
    display: flex; 
    width: 100vw; 
    height: calc(100vh - 60px); 
    gap: 5px;
}

.cam-box { 
    flex: 1; 
    position: relative; 
    background: #000; 
    border: 1px solid #333;
    display: flex;
    flex-direction: column;
}

.cam-box span { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.5); padding: 5px; font-size: 12px; }

video, canvas { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
    transform: scaleX(-1); /* Mirrors the feed like a real call */
}
