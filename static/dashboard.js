document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');

    let apiBaseUrl = '';

    async function loadConfig() {
        try {
            const response = await fetch('/config');
            const config = await response.json();
            apiBaseUrl = config.api_base_url;
        } catch (error) {
            console.error('Error loading config:', error);
            showToast('Unable to connect to server. Please try again later.', 'error');
        }
    }

    async function loadSelectedBackground() {
    try {
        if (!apiBaseUrl) {
            await loadConfig();
        }
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found, skipping load selected background');
            return;
        }
        const response = await fetch(`${apiBaseUrl}/get-selected-background`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok && data.background_url) {
            setBackground(data.background_url);
            console.log('Loaded selected background:', data.background_url);
        } else {
            console.log('No background selected or error:', data);
        }
    } catch (error) {
        console.error('Error loading selected background:', error);
        showToast('Error loading selected background!', 'error');
    }
}

    if (!window.AudioContext && !window.webkitAudioContext) {
        console.error('Web Audio API is not supported in this browser.');
        showToast('Browser does not support audio wave effect!', 'error');
        document.getElementById('toggle-wave-btn').disabled = true;
    }

    let currentPage = 1;
    const itemsPerPage = 24;
    const miniShuffleBtn = document.getElementById('mini-shuffle-btn');
    const playerMiniPrevBtn = document.getElementById('player-mini-prev-btn');
    const playerMiniNextBtn = document.getElementById('player-mini-next-btn');
    const scrollBtn = document.getElementById('scroll-to-top');
    const equalizerMiniBtn = document.getElementById('equalizer-mini-btn');
    const audioPlayer = document.getElementById('audio-player');
    const searchInput = document.getElementById('search-input');
    const trackList = document.getElementById('track-list');
    const player = document.getElementById('player');
    const trackThumbnail = document.getElementById('track-thumbnail');
    const trackTitle = document.getElementById('track-title');
    const trackDuration = document.getElementById('track-duration');
    const seekSlider = document.getElementById('seek-slider');
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    const loopBtn = document.getElementById('loop-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const musicPlayerContainer = document.getElementById('music-player-container');
    const playerBgBlur = document.getElementById('player-bg-blur');
    const playerThumbnail = document.getElementById('player-thumbnail');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerSeekSlider = document.getElementById('player-seek-slider');
    const playerCurrentTime = document.getElementById('player-current-time');
    const playerTotalTime = document.getElementById('player-total-time');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playerPrevBtn = document.getElementById('player-prev-btn');
    const playerNextBtn = document.getElementById('player-next-btn');
    const playerLoopBtn = document.getElementById('player-loop-btn');
    const playerVolumeBtn = document.getElementById('player-volume-btn');
    const volumePanel = document.getElementById('volume-panel');
    const equalizerBtn = document.getElementById('equalizer-btn');
    const equalizerPanel = document.getElementById('equalizer-panel');
    const equalizerSliders = document.getElementById('equalizer-sliders');
    const resetEqualizerBtn = document.getElementById('reset-equalizer');
    const presetsBtn = document.getElementById('presets-btn');
    const equalizerPresets = document.getElementById('equalizer-presets');
    const bitrateBtn = document.getElementById('bitrate-btn');
    const bitratePresets = document.getElementById('bitrate-presets');
    const uploadSongBtn = document.getElementById('upload-song-btn');
    const uploadSongModal = document.getElementById('upload-song-modal');
    const uploadSongForm = document.getElementById('upload-song-form');
    const cancelSongUpload = document.getElementById('cancel-song-upload');
    const uploadBgBtn = document.getElementById('upload-bg-btn');
    const uploadBgModal = document.getElementById('upload-bg-modal');
    const uploadBgForm = document.getElementById('upload-bg-form');
    const cancelBgUpload = document.getElementById('cancel-bg-upload');
    const bgItems = document.getElementById('bg-items');
    const homeBtn = document.getElementById('home-btn');
    const homeContainer = document.getElementById('home-container');
    const backgroundContainer = document.getElementById('background-container');
    const mainContent = document.getElementById('main-content');
    const logoutBtn = document.getElementById('logout-btn');
    const neonBorder = document.createElement('div');
    neonBorder.id = 'neon-border';
    document.body.appendChild(neonBorder);
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    document.body.appendChild(overlay);
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
    const progressBar = document.createElement('div');
    progressBar.id = 'upload-progress';
    progressBar.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 w-64 h-2 bg-gray-700 rounded-full hidden';
    progressBar.innerHTML = `<div id="progress-fill" class="h-full bg-green-500 rounded-full" style="width: 0%"></div>`;
    document.body.appendChild(progressBar);

    const queueContainer = document.createElement('div');
    queueContainer.id = 'queue-container';
    queueContainer.className = 'fixed top-0 right-0 w-80 h-full bg-gray-900 bg-opacity-90 p-4 overflow-y-auto hidden';
    document.body.appendChild(queueContainer);

    const queueList = document.createElement('div');
    queueList.id = 'queue-list';
    queueContainer.appendChild(queueList);

    const queueToggleBtn = document.getElementById('queue-toggle-btn');

    const miniPlayPauseBtn = document.getElementById('mini-play-pause-btn');
    const miniTrackTitle = document.getElementById('mini-track-title');
    const miniSeekSlider = document.getElementById('mini-seek-slider');
    const miniCurrentTime = document.getElementById('mini-current-time');
    const miniTotalTime = document.getElementById('mini-total-time');
    const miniThumbnail = document.getElementById('mini-thumbnail');
    const miniVolumeBtn = document.getElementById('mini-volume-btn');
    const miniLoopBtn = document.getElementById('mini-loop-btn');
    const boostVolumeBtn = document.getElementById('boost-volume-btn');
    const boostContainer = document.getElementById('boost-container');
    const boostInput = document.getElementById('boost-input');
    const boostConfirmBtn = document.getElementById('boost-confirm-btn');

    const toggleWaveBtn = document.getElementById('toggle-wave-btn');
    const simplifyWaveBtn = document.getElementById('simplify-wave-btn');
    const waveCanvas = document.getElementById('waveCanvas');
    const ctx = waveCanvas?.getContext('2d');
    const centerX = waveCanvas?.width / 2;
    const centerY = waveCanvas?.height / 2;
    const bars = 100;
    let baseRadius = 120;
    let currentRadius = 0;
    let colorTop = '#ff00cc';
    let analyser, dataArray, smoothData = new Array(bars).fill(0);
    let waveEnabled = false;

    let currentTracks = [];
    let currentTrackIndex = -1;
    let isPlaying = false;
    let currentToast = null;
    let songUploadXhr = null;
    let queuedTracks = [];

    let audioContext;
    let sourceNode;
    let gainNode;
    const filters = [];
    const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

    const equalizerPresetsData = {
        "Flat": Array(frequencies.length).fill(0),
        "Bass Boost": [6, 5, 4, 3, 2, 1, 0, 0, 0, 0],
        "Vocal": [-2, -1, 0, 1, 2, 3, 2, 1, 0, -1],
        "Treble Boost": [0, 0, 0, 0, 1, 2, 3, 4, 5, 6],
        "Gaming": [2, 1, 0, 0, 1, 2, 3, 2, 1, 0],
        "Volume Boost": Array(frequencies.length).fill(3),
        "Music": [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        "Movie": [2, 1, 0, 0, 0, 0, 1, 2, 3, 4],
        "Rock": [4, 2, 0, -2, -4, -2, 0, 2, 4, 6],
        "Pop": [-2, 0, 2, 4, 2, 0, -2, -4, -6, -8],
        "Jazz": [2, 4, 2, 0, -2, 0, 2, 4, 6, 8],
        "Anti Crackling": [-3.5, -3.5, -3.5, -3.5, -3.5, -3.5, -3.5, -3.5, -3.5, -3.5]
    };

    const bitrateOptions = [
        { name: '128 kbps', value: 128 },
        { name: '256 kbps', value: 256 },
        { name: '320 kbps', value: 320 }
    ];

    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        #mini-track-title:hover, #mini-thumbnail:hover {
            cursor: pointer;
        }
        #first-page-btn, #last-page-btn {
            background-color: rgba(59, 131, 246, 0);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 8px rgba(243, 243, 243, 0.6);
            color: white;
            font-weight: 600;
            transition: transform 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease;
        }
        #first-page-btn:hover, #last-page-btn:hover {
            background-color: rgba(230, 230, 230, 0.39);
            transform: scale(1.05);
            box-shadow: 0 0 12px rgba(243, 243, 243, 0.925);
        }
        #first-page-btn:disabled, #last-page-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
    `;
    document.head.appendChild(styleSheet);

    const colorThiefScript = document.createElement('script');
    colorThiefScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js';
    document.head.appendChild(colorThiefScript);

    homeContainer.classList.add('hidden');

    const playerShuffleBtn = document.getElementById('player-shuffle-btn');
    let isShuffle = false;

    if (!playerShuffleBtn) {
        console.error('player-shuffle-btn not found in DOM');
        showToast('Shuffle button not found!', 'error');
    }
    if (!miniShuffleBtn) {
        console.error('mini-shuffle-btn not found in DOM');
        showToast('Mini shuffle button not found!', 'error');
    }

    function syncShuffleButtons() {
        if (playerShuffleBtn) {
            playerShuffleBtn.classList.toggle('active', isShuffle);
        }
        if (miniShuffleBtn) {
            miniShuffleBtn.classList.toggle('active', isShuffle);
        }
    }

    if (playerShuffleBtn) {
        playerShuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            syncShuffleButtons();
        });
    }

    if (miniShuffleBtn) {
        miniShuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            syncShuffleButtons();
        });
    }

    syncShuffleButtons();

    if (queueToggleBtn) {
        queueToggleBtn.addEventListener('click', () => {
            queueContainer.classList.toggle('hidden');
        });
    } else {
        console.error('queue-toggle-btn not found in DOM');
        showToast('Queue toggle button not found!', 'error');
    }

    function updateQueueList() {
        queueList.innerHTML = '<h3 class="text-lg font-semibold text-white mb-4">Queue</h3>';
        if (queuedTracks.length === 0) {
            queueList.innerHTML += '<p class="text-gray-400">No tracks in queue</p>';
            return;
        }
        queuedTracks.forEach((track, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item flex items-center bg-gray-800 rounded-lg p-2 mb-2 cursor-pointer hover:bg-gray-700 transition-all duration-200';
            queueItem.innerHTML = `
                <img src="${apiBaseUrl}${track.thumbnail}" 
                     alt="${track.title}" 
                     class="w-12 h-12 object-cover rounded mr-2"
                     onerror="this.src='https://via.placeholder.com/50'">
                <div class="flex-1">
                    <h4 class="text-sm font-semibold text-white truncate" title="${track.title}">${track.title}</h4>
                    <p class="text-xs text-gray-400">${track.artist || ''}</p>
                </div>
                <button class="remove-queue-btn text-red-500 hover:text-red-600" data-index="${index}">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                </button>
            `;
            queueItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-queue-btn')) {
                    playTrack(track, true);
                    currentTrackIndex = currentTracks.findIndex(t => t.url === track.url);
                    updatePlayPauseState();
                }
            });
            queueItem.querySelector('.remove-queue-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                queuedTracks.splice(index, 1);
                updateQueueList();
                showToast(`Removed ${track.title} from queue`, 'success');
            });
            queueList.appendChild(queueItem);
        });
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    }

    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function brightenColor(rgbColor, amount = 0.2) {
        const [r, g, b] = rgbColor.match(/\d+/g).map(Number);
        const [h, s, l] = rgbToHsl(r, g, b);
        const newL = Math.min(1, l + amount);
        const [newR, newG, newB] = hslToRgb(h, s, newL);
        return `rgb(${newR},${newG},${newB})`;
    }

    function extractDominantColor(imageElement, callback) {
        if (typeof ColorThief === 'undefined') {
            callback('#ff00cc');
            return;
        }
        const colorThief = new ColorThief();
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageElement.src;
        img.onload = () => {
            try {
                const dominantColor = colorThief.getColor(img);
                const rgbColor = `rgb(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]})`;
                const brightColor = brightenColor(rgbColor, 0.2);
                const styleSheet = document.createElement('style');
                styleSheet.innerHTML = `
                    @keyframes rainbowShift {
                        0% {
                            filter: drop-shadow(0 0 40px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},1));
                            border-color: rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},1);
                            box-shadow: 0 0 30px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},1),
                                        0 0 60px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.95),
                                        0 0 90px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.9),
                                        0 0 120px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.85),
                                        0 0 150px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.8);
                        }
                        50% {
                            filter: drop-shadow(0 0 50px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.8));
                            border-color: rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.8);
                            box-shadow: 0 0 40px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.8),
                                        0 0 80px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.75),
                                        0 0 110px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.7),
                                        0 0 140px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.65),
                                        0 0 170px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.6);
                        }
                        100% {
                            filter: drop-shadow(0 0 40px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},1));
                            border-color: rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},1);
                            box-shadow: 0 0 30px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},1),
                                        0 0 60px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.95),
                                        0 0 90px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.9),
                                        0 0 120px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.85),
                                        0 0 150px rgba(${dominantColor[0]},${dominantColor[1]},${dominantColor[2]},0.8);
                        }
                    }
                `;
                document.head.appendChild(styleSheet);
                callback(brightColor);
            } catch (error) {
                callback('#ff00cc');
            }
        };
        img.onerror = () => {
            callback('#ff00cc');
        };
    }

    function setupAnalyser(audioElement) {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {}).catch(err => {
                        showToast('Cannot resume audio context!', 'error');
                    });
                }
            }
            if (!sourceNode) {
                sourceNode = audioContext.createMediaElementSource(audioElement);
            }
            if (!gainNode) {
                gainNode = audioContext.createGain();
                gainNode.gain.value = parseFloat(volumeSlider.value);
            }
            if (!analyser) {
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }

            sourceNode.disconnect();
            sourceNode.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (filters.length > 0) {
                analyser.disconnect();
                sourceNode.connect(filters[0]);
                for (let i = 0; i < filters.length - 1; i++) {
                    filters[i].connect(filters[i + 1]);
                }
                filters[filters.length - 1].connect(gainNode);
            }
        } catch (error) {
            showToast('Error initializing audio wave!', 'error');
        }
    }

    function drawWave() {
        if (!waveCanvas || !ctx) {
            return;
        }
        requestAnimationFrame(() => {
            ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

            if (waveEnabled && currentRadius < baseRadius) {
                currentRadius += 4;
            } else if (!waveEnabled && currentRadius > 0) {
                currentRadius -= 4;
            }

            if (analyser && dataArray && currentRadius > 0) {
                analyser.getByteFrequencyData(dataArray);
                const maxFreq = Math.max(...dataArray, 10);
                const amplification = 0.1;
                const minHeight = 20;

                for (let i = 0; i < bars; i++) {
                    let freqValue = dataArray[i % dataArray.length];
                    let normalizedValue = (freqValue / maxFreq) * amplification;
                    normalizedValue = Math.pow(normalizedValue, 0.5);
                    smoothData[i] += (normalizedValue * 255 - smoothData[i]) * 0.5;
                    let height = Math.max(smoothData[i] * 0.9 + minHeight, minHeight);

                    const softLimit = 80;
                    const softness = 12;

                    if (height > softLimit) {
                        height = softLimit + Math.log1p(height - softLimit) * softness;
                    }

                    const angle = (i / bars) * Math.PI * 2;
                    const x1 = centerX + Math.cos(angle) * currentRadius;
                    const y1 = centerY + Math.sin(angle) * currentRadius;
                    const x2 = centerX + Math.cos(angle) * (currentRadius + height);
                    const y2 = centerY + Math.sin(angle) * (currentRadius + height);

                    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                    gradient.addColorStop(0, 'rgba(255,255,255,0.7)');
                    gradient.addColorStop(1, colorTop);

                    ctx.strokeStyle = gradient;
                    ctx.shadowBlur = 40;
                    ctx.shadowColor = `rgba(${colorTop.slice(4, -1)}, 0.8)`;
                    ctx.lineWidth = 7;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();

                    ctx.strokeStyle = `rgba(${colorTop.slice(4, -1)}, 0.5)`;
                    ctx.shadowBlur = 60;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }

            drawWave();
        });
    }

    if (waveCanvas && ctx) {
        drawWave();
    }

    function showToast(message, type = 'success', isProgress = false) {
        if (isProgress && currentToast) {
            currentToast.querySelector('.toast-text').textContent = message;
            return;
        }

        if (currentToast && !isProgress) {
            toastContainer.removeChild(currentToast);
            currentToast = null;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const text = document.createElement('div');
        text.className = 'toast-text';
        text.textContent = message;
        toast.appendChild(text);
        toastContainer.appendChild(toast);
        toast.style.animation = 'slideInExpand 1s forwards';
        setTimeout(() => {
            toast.classList.add('expanded');
        }, 1000);

        if (!isProgress) {
            setTimeout(() => {
                toast.classList.remove('expanded');
                toast.style.animation = 'shrinkAndSlideUp 1s forwards';
            }, 4000);
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                    if (toast === currentToast) currentToast = null;
                }
            }, 5000);
        }

        currentToast = toast;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    function updatePlayPauseState() {
        if (isPlaying) {
            playerThumbnail.classList.add('playing');
            miniThumbnail.classList.add('playing');
            playPauseBtn.innerHTML = `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;
            miniPlayPauseBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;
        } else {
            playerThumbnail.classList.remove('playing');
            miniThumbnail.classList.remove('playing');
            playPauseBtn.innerHTML = `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`;
            miniPlayPauseBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`;
        }
        miniTrackTitle.textContent = currentTracks[currentTrackIndex]?.title || '';
        if (!musicPlayerContainer.classList.contains('hidden') || (currentTrackIndex < 0 || !currentTracks[currentTrackIndex])) {
            homeContainer.classList.add('hidden');
        } else if (mainContent.classList.contains('hidden')) {
            homeContainer.classList.add('hidden');
        } else {
            homeContainer.classList.remove('hidden');
        }
    }

    function setupAudioContext() {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {}).catch(err => {
                        showToast('Cannot resume audio context!', 'error');
                    });
                }
            }
            if (!sourceNode) {
                sourceNode = audioContext.createMediaElementSource(audioPlayer);
            }
            if (!gainNode) {
                gainNode = audioContext.createGain();
                gainNode.gain.value = parseFloat(volumeSlider.value);
            }

            const currentGains = filters.map(filter => filter.gain.value);

            if (filters.length === 0) {
                frequencies.forEach((freq) => {
                    const filter = audioContext.createBiquadFilter();
                    filter.type = 'peaking';
                    filter.frequency.value = freq;
                    filter.Q.value = 1;
                    filter.gain.value = 0;
                    filters.push(filter);
                });
            }

            filters.forEach((filter, index) => {
                if (currentGains[index] !== undefined) {
                    filter.gain.value = currentGains[index];
                }
            });

            sourceNode.disconnect();

            if (waveEnabled && analyser) {
                sourceNode.connect(analyser);
                analyser.disconnect();
                analyser.connect(filters[0]);
            } else {
                sourceNode.connect(filters[0]);
            }

            for (let i = 0; i < filters.length - 1; i++) {
                filters[i].disconnect();
                filters[i].connect(filters[i + 1]);
            }
            filters[filters.length - 1].disconnect();
            filters[filters.length - 1].connect(gainNode);
            gainNode.disconnect();
            gainNode.connect(audioContext.destination);
        } catch (e) {
            showToast('Error setting up audio context!', 'error');
        }
    }

    async function loadTracks(query = '') {
        try {
            if (!apiBaseUrl) {
                await loadConfig();
            }
            const url = query ? `/search?q=${encodeURIComponent(query)}` : '/tracks';
            const response = await fetch(`${apiBaseUrl}${url}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const searchResults = await response.json();

            const currentTrack = currentTrackIndex >= 0 && currentTracks[currentTrackIndex] ? currentTracks[currentTrackIndex] : null;

            if (!query) {
                currentTracks = searchResults;
                if (currentTrack) {
                    currentTrackIndex = currentTracks.findIndex(track => track.url === currentTrack.url);
                    if (currentTrackIndex === -1 && isPlaying) {
                        currentTracks.push(currentTrack);
                        currentTrackIndex = currentTracks.length - 1;
                    }
                } else {
                    currentTrackIndex = -1;
                    if (!isPlaying) {
                        audioPlayer.pause();
                        audioPlayer.src = '';
                    }
                }
            }

            const totalPages = Math.ceil(searchResults.length / itemsPerPage);
            currentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
            displayTracks(searchResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
            updatePaginationUI(totalPages);
            updatePlayPauseState();
        } catch (error) {
            trackList.innerHTML = '<p class="text-red-500">Error loading tracks! Check server or music folder.</p>';
            showToast('Error loading tracks!', 'error');
        }
    }

    function displayTracks(tracks) {
        trackList.innerHTML = '';
        if (!tracks.length) {
            trackList.innerHTML = '<p class="text-gray-400">No tracks found!</p>';
            return;
        }
        tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item cursor-pointer bg-gray-800 rounded-lg p-2 transition-transform transform hover:scale-105';
            trackItem.style.animationDelay = `${index * 0.05}s`;

            trackItem.innerHTML = `
                <img src="${apiBaseUrl}${track.thumbnail}" 
                     alt="${track.title}" 
                     class="w-full h-32 object-cover rounded"
                     onerror="this.src='https://via.placeholder.com/200'">

                <div class="track-info mt-2">
                    <h3 class="text-sm font-semibold truncate">${track.title}</h3>
                    <p class="text-xs text-gray-400">${track.artist || ''}</p>
                </div>

                <div class="mt-2 flex justify-center">
                    <button class="queue-next-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded flex items-center gap-1 transition-transform duration-200 transform hover:scale-105">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M3 5.5h10a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2Zm0 5h10a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2Zm0 5h7a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2Z"/>
                            <path d="M15.5 10.5v-2a.75.75 0 1 1 1.5 0v2h2a.75.75 0 1 1 0 1.5h-2v2a.75.75 0 1 1-1.5 0v-2h-2a.75.75 0 1 1 0-1.5h2Z"/>
                        </svg>
                        
                    </button>
                    <div class="mt-2 flex justify-center">
                    
                </div>
            `;

            trackItem.querySelector('.queue-next-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (!queuedTracks.some(t => t.url === track.url)) {
                    queuedTracks.push(track);
                    updateQueueList();
                    queueContainer.classList.remove('hidden');
                    showToast(`Added ${track.title} to queue`, 'success');
                } else {
                    showToast(`${track.title} is already in queue`, 'info');
                }
            });

            trackItem.addEventListener('click', () => {
                currentTrackIndex = currentTracks.findIndex(t => t.url === track.url);
                playTrack(track, true);
            });

            trackList.appendChild(trackItem);
        });
    }

    function updatePaginationUI(totalPages) {
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');
        const firstPageBtn = document.getElementById('first-page-btn');
        const lastPageBtn = document.getElementById('last-page-btn');
        const pageInfo = document.getElementById('page-info');

        pageInfo.textContent = `Page ${currentPage} / ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        firstPageBtn.disabled = currentPage === 1 || totalPages === 0;
        lastPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadTracks(searchInput.value);
        }
    });

    document.getElementById('next-page-btn').addEventListener('click', () => {
        const totalPages = Math.ceil(currentTracks.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadTracks(searchInput.value);
        }
    });

    document.getElementById('first-page-btn').addEventListener('click', () => {
        if (currentPage !== 1) {
            currentPage = 1;
            loadTracks(searchInput.value);
        }
    });

    document.getElementById('last-page-btn').addEventListener('click', () => {
        const totalPages = Math.ceil(currentTracks.length / itemsPerPage);
        if (currentPage !== totalPages && totalPages > 0) {
            currentPage = totalPages;
            loadTracks(searchInput.value);
        }
    });

    function playTrack(track, showPlayer = false) {
        if (!track) return;
        const thumbnailUrl = `${apiBaseUrl}${track.thumbnail}`;
        const trackUrl = `${apiBaseUrl}${track.url}`;
        trackThumbnail.src = thumbnailUrl;
        trackTitle.textContent = track.title;
        trackDuration.textContent = track.artist || '';
        playerThumbnail.src = thumbnailUrl;
        playerTitle.textContent = track.title;
        playerArtist.textContent = track.artist || '';
        miniTrackTitle.textContent = track.title;
        miniThumbnail.src = thumbnailUrl;
        playerBgBlur.style.backgroundImage = `url('${thumbnailUrl}')`;
        overlay.style.backgroundImage = `url('${thumbnailUrl}')`;
        overlay.style.backgroundBlendMode = 'overlay';
        overlay.style.filter = 'blur(50px) brightness(0.7)';
        playerTitle.classList.remove('animate-text');
        playerArtist.classList.remove('animate-text');
        void playerTitle.offsetWidth;
        void playerArtist.offsetWidth;
        playerTitle.classList.add('animate-text');
        playerArtist.classList.add('animate-text');
        audioPlayer.src = trackUrl;
        audioPlayer.load();

        if (showPlayer) {
            player.classList.remove('hidden');
            musicPlayerContainer.classList.remove('hidden');
            mainContent.classList.add('hidden');
            homeContainer.classList.add('hidden');
        } else {
            player.classList.add('hidden');
            musicPlayerContainer.classList.add('hidden');
            mainContent.classList.remove('hidden');
            if (currentTrackIndex >= 0 && currentTracks[currentTrackIndex]) {
                homeContainer.classList.remove('hidden');
            } else {
                homeContainer.classList.add('hidden');
            }
        }

        extractDominantColor(playerThumbnail, (color) => {
            colorTop = color;
        });

        setupAudioContext();
        if (waveEnabled && !analyser) {
            setupAnalyser(audioPlayer);
        }

        audioPlayer.volume = parseFloat(volumeSlider.value);
        if (gainNode) {
            gainNode.gain.value = parseFloat(volumeSlider.value);
        }

        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayPauseState();
        }).catch(error => {
            isPlaying = false;
            updatePlayPauseState();
            showToast('Cannot play track. Check MP3 file or server.', 'error');
        });
    }

    function playNext() {
        if (queuedTracks.length > 0) {
            const nextTrack = queuedTracks.shift();
            currentTrackIndex = currentTracks.findIndex(t => t.url === nextTrack.url);
            playTrack(nextTrack, false);
            updateQueueList();
        } else if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * currentTracks.length);
            currentTrackIndex = randomIndex;
            playTrack(currentTracks[currentTrackIndex], false);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % currentTracks.length;
            playTrack(currentTracks[currentTrackIndex], false);
        }
    }

    function playPrev() {
        currentTrackIndex = (currentTrackIndex - 1 + currentTracks.length) % currentTracks.length;
        const track = currentTracks[currentTrackIndex];
        if (!track) return;
        playTrack(track, false);
    }

    miniPlayPauseBtn.addEventListener('click', () => {
        if (!audioContext) {
            setupAudioContext();
            if (waveEnabled && !analyser) {
                setupAnalyser(audioPlayer);
            }
        }
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseState();
        audioPlayer.volume = parseFloat(volumeSlider.value);
        if (gainNode) {
            gainNode.gain.value = parseFloat(volumeSlider.value);
        }
    });

    miniSeekSlider.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const time = (miniSeekSlider.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = time;
        }
    });


    if (boostVolumeBtn) {
        boostVolumeBtn.addEventListener('click', () => {
            boostContainer.classList.toggle('hidden');
        });
    }
        if (boostConfirmBtn) {
        boostConfirmBtn.addEventListener('click', () => {
            const boostValue = parseFloat(boostInput.value);
            if (isNaN(boostValue) || boostValue < 1 || boostValue > 5) {
                showToast('Boost value must be between 1 and 5!', 'error');
                return;
            }
            if (gainNode) {
                gainNode.gain.setValueAtTime(boostValue, audioContext.currentTime);
                showToast(`Volume boosted to ${boostValue}x`, 'success');
                boostContainer.classList.add('hidden');
                boostInput.value = '';
            } else {
                showToast('Audio not initialized yet!', 'error');
            }
        });
    }

    const volumeIcon = playerVolumeBtn.querySelector('svg path');
    const miniVolumeIcon = miniVolumeBtn.querySelector('svg path');
    const iconUnmute = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
    const iconMute = "M3 9v6h4l5 5V4L7 9H3z M20 9.41L18.59 8 16 10.59 13.41 8 12 9.41 14.59 12 12 14.59 13.41 16 16 13.41 18.59 16 20 14.59 17.41 12 20 9.41z";

    miniVolumeBtn.addEventListener('click', () => {
        audioPlayer.muted = !audioPlayer.muted;
        volumeIcon.setAttribute('d', audioPlayer.muted ? iconMute : iconUnmute);
        miniVolumeIcon.setAttribute('d', audioPlayer.muted ? iconMute : iconUnmute);
    });

    playerVolumeBtn.addEventListener('click', () => {
        audioPlayer.muted = !audioPlayer.muted;
        volumeIcon.setAttribute('d', audioPlayer.muted ? iconMute : iconUnmute);
        miniVolumeIcon.setAttribute('d', audioPlayer.muted ? iconMute : iconUnmute);
    });
    

    miniLoopBtn.addEventListener('click', () => {
        audioPlayer.loop = !audioPlayer.loop;
        playerLoopBtn.classList.toggle('active', audioPlayer.loop);
        miniLoopBtn.classList.toggle('active', audioPlayer.loop);
    });

    playerLoopBtn.addEventListener('click', () => {
        audioPlayer.loop = !audioPlayer.loop;
        playerLoopBtn.classList.toggle('active', audioPlayer.loop);
        miniLoopBtn.classList.toggle('active', audioPlayer.loop);
    });

    equalizerMiniBtn.addEventListener('click', () => {
        const isActive = equalizerPanel.classList.toggle('active');
        neonBorder.classList.toggle('on', isActive);
        overlay.classList.toggle('active', isActive);
        if (isActive) {
            equalizerPanel.style.animation = 'none';
            void equalizerPanel.offsetWidth;
            equalizerPanel.style.animation = '';
            setupAudioContext();
            createEqualizerSliders();
            populatePresets();
            presetsBtn.textContent = 'Fast';
        } else {
            equalizerPresets.classList.remove('active');
            bitratePresets.classList.remove('active');
            equalizerPanel.style.animation = 'none';
            void equalizerPanel.offsetWidth;
            equalizerPanel.style.animation = '';
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
            seekSlider.value = value;
            playerSeekSlider.value = value;
            miniSeekSlider.value = value;
            playerSeekSlider.style.setProperty('--value', `${value}%`);
            miniSeekSlider.style.setProperty('--value', `${value}%`);
            currentTime.textContent = formatTime(audioPlayer.currentTime);
            playerCurrentTime.textContent = formatTime(audioPlayer.currentTime);
            miniCurrentTime.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTime.textContent = formatTime(audioPlayer.duration);
        playerTotalTime.textContent = formatTime(audioPlayer.duration);
        miniTotalTime.textContent = formatTime(audioPlayer.duration);
    });

    playPauseBtn.addEventListener('click', () => {
        if (!audioContext) {
            setupAudioContext();
            if (waveEnabled && !analyser) {
                setupAnalyser(audioPlayer);
            }
        }
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseState();
        audioPlayer.volume = parseFloat(volumeSlider.value);
        if (gainNode) {
            gainNode.gain.value = parseFloat(volumeSlider.value);
        }
    });

    playerNextBtn.addEventListener('click', () => playNext());
    playerPrevBtn.addEventListener('click', () => playPrev());
    playerMiniNextBtn.addEventListener('click', () => playNext());
    playerMiniPrevBtn.addEventListener('click', () => playPrev());

    audioPlayer.addEventListener('ended', () => {
        if (audioPlayer.loop) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            playNext();
        }
    });

    seekSlider.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const time = (seekSlider.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = time;
        }
    });

    playerSeekSlider.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const time = (playerSeekSlider.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = time;
        }
    });

    loopBtn.addEventListener('click', () => {
        audioPlayer.loop = !audioPlayer.loop;
        loopBtn.classList.toggle('text-blue-500', audioPlayer.loop);
        miniLoopBtn.classList.toggle('active', audioPlayer.loop);
        playerLoopBtn.classList.toggle('active', audioPlayer.loop);
        showToast(audioPlayer.loop ? 'Loop enabled' : 'Loop disabled', 'success');
    });

    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = parseFloat(volumeSlider.value);
        if (gainNode) {
            gainNode.gain.value = parseFloat(volumeSlider.value);
        }
    });

    equalizerBtn.addEventListener('click', () => {
        const isActive = equalizerPanel.classList.toggle('active');
        neonBorder.classList.toggle('on', isActive);
        overlay.classList.toggle('active', isActive);
        if (isActive) {
            equalizerPanel.style.animation = 'none';
            void equalizerPanel.offsetWidth;
            equalizerPanel.style.animation = '';
            setupAudioContext();
            createEqualizerSliders();
            populatePresets();
            presetsBtn.textContent = 'Fast';
        } else {
            equalizerPresets.classList.remove('active');
            bitratePresets.classList.remove('active');
            equalizerPanel.style.animation = 'none';
            void equalizerPanel.offsetWidth;
            equalizerPanel.style.animation = '';
        }
    });

    presetsBtn.addEventListener('click', () => {
        const isPresetsActive = equalizerPresets.classList.toggle('active');
        if (isPresetsActive) {
            populatePresets();
            setTimeout(() => {
                bitratePresets.classList.add('active');
                populateBitratePresets();
            }, 60);
        } else {
            equalizerPresets.classList.remove('active');
            bitratePresets.classList.remove('active');
        }
    });

    bitrateBtn.addEventListener('click', () => {
        bitratePresets.classList.toggle('active');
        if (bitratePresets.classList.contains('active')) {
            populateBitratePresets();
        }
    });

    resetEqualizerBtn.addEventListener('click', () => {
        resetEqualizer();
    });

    toggleWaveBtn.addEventListener('click', () => {
        waveEnabled = !waveEnabled;
        toggleWaveBtn.textContent = waveEnabled ? '🌊 Off' : '🌊 Wave';
        if (waveEnabled && !analyser) {
            setupAnalyser(audioPlayer);
        } else {
            setupAudioContext();
        }
        audioPlayer.volume = parseFloat(volumeSlider.value);
        if (gainNode) {
            gainNode.gain.value = parseFloat(volumeSlider.value);
        }
        showToast(waveEnabled ? 'Wave effect enabled' : 'Wave effect disabled', 'success');
    });

    simplifyWaveBtn.addEventListener('click', () => {
        simplifyWaveBtn.style.display = 'none';
        showToast('Warning disabled!', 'success');
    });

    homeBtn.addEventListener('click', async () => {
        player.classList.add('hidden');
        musicPlayerContainer.classList.add('hidden');
        mainContent.classList.remove('hidden');
        equalizerPanel.classList.remove('active');
        equalizerPresets.classList.remove('active');
        bitratePresets.classList.remove('active');
        volumePanel.classList.remove('active');
        neonBorder.classList.remove('on');
        overlay.classList.remove('active');
        searchInput.value = '';

        if (currentTrackIndex >= 0 && currentTracks[currentTrackIndex]) {
            homeContainer.classList.remove('hidden');
        } else {
            homeContainer.classList.add('hidden');
        }

        if (waveEnabled) {
            waveEnabled = false;
            toggleWaveBtn.textContent = '🌊 Wave';
            setupAudioContext();
            showToast('Wave effect disabled', 'success');
        }

        updatePlayPauseState();
        await loadTracks();
    });

    miniTrackTitle.addEventListener('click', () => {
        if (currentTrackIndex >= 0 && currentTracks[currentTrackIndex]) {
            player.classList.remove('hidden');
            musicPlayerContainer.classList.remove('hidden');
            mainContent.classList.add('hidden');
            homeContainer.classList.add('hidden');
            updatePlayPauseState();
        }
    });

    miniThumbnail.addEventListener('click', () => {
        if (currentTrackIndex >= 0 && currentTracks[currentTrackIndex]) {
            player.classList.remove('hidden');
            musicPlayerContainer.classList.remove('hidden');
            mainContent.classList.add('hidden');
            homeContainer.classList.add('hidden');
            updatePlayPauseState();
        }
    });

    const submitLinkUpload = document.getElementById('submit-link-upload');
    submitLinkUpload.addEventListener('click', async () => {
        if (!apiBaseUrl) {
            await loadConfig();
        }
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to upload a song.', 'error');
            return;
        }
        const songLinkInput = document.getElementById('song-link-input');
        const link = songLinkInput.value.trim();

        if (!link) {
            showToast('Enter a valid YouTube or SoundCloud link!', 'error');
            return;
        }

        showToast('Uploading song from link...', 'info', true);
        progressBar.classList.remove('hidden');
        document.getElementById('progress-fill').style.width = '0%';

        try {
            const response = await fetch(`${apiBaseUrl}/upload-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: link })
            });
            const data = await response.json();
            progressBar.classList.add('hidden');
            if (response.ok) {
                if (currentToast) {
                    currentToast.querySelector('.toast-text').textContent = 'Song uploaded successfully!';
                    currentToast.classList.remove('info');
                    currentToast.classList.add('success');

                    setTimeout(() => {
                        if (currentToast) {
                            currentToast.classList.remove('expanded');
                            currentToast.style.animation = 'shrinkAndSlideUp 1s forwards';
                        }
                    }, 4000);

                    setTimeout(() => {
                        if (currentToast && toastContainer.contains(currentToast)) {
                            toastContainer.removeChild(currentToast);
                            currentToast = null;
                        }
                    }, 5000);
                }

                uploadSongModal.classList.add('hidden');
                songLinkInput.value = '';
                await loadTracks();
            } else {
                if (currentToast) {
                    toastContainer.removeChild(currentToast);
                    currentToast = null;
                }
                showToast(data.message || 'Error uploading song from link!', 'error');
            }
        } catch (error) {
            progressBar.classList.add('hidden');
            if (currentToast) {
                toastContainer.removeChild(currentToast);
                currentToast = null;
            }
            showToast('Connection error during song upload!', 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    searchInput.addEventListener('input', debounce(e => {
        loadTracks(e.target.value);
    }, 300));

    uploadSongBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to upload a song.', 'error');
            return;
        }
        uploadSongModal.classList.remove('hidden');
    });

    cancelSongUpload.addEventListener('click', () => {
        if (songUploadXhr) {
            songUploadXhr.abort();
            songUploadXhr = null;
        }
        uploadSongModal.classList.add('hidden');
        progressBar.classList.add('hidden');
        if (currentToast) {
            toastContainer.removeChild(currentToast);
            currentToast = null;
        }
    });

    uploadSongForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!apiBaseUrl) {
            await loadConfig();
        }
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to upload a song.', 'error');
            return;
        }
        const formData = new FormData(uploadSongForm);
        const fileInput = uploadSongForm.querySelector('input[type="file"][name="song"]');
        const file = fileInput.files[0];

        if (file && file.type.startsWith('audio/mpeg')) {
            progressBar.classList.remove('hidden');
            songUploadXhr = new XMLHttpRequest();
            songUploadXhr.open('POST', `${apiBaseUrl}/upload`, true);
            songUploadXhr.setRequestHeader('Authorization', `Bearer ${token}`);

            songUploadXhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    document.getElementById('progress-fill').style.width = `${percentComplete}%`;
                    showToast(`Uploading: ${Math.round(percentComplete)}%`, 'success', true);
                }
            };

            songUploadXhr.onload = () => {
                progressBar.classList.add('hidden');
                try {
                    const data = JSON.parse(songUploadXhr.responseText);
                    if (songUploadXhr.status === 200) {
                        if (currentToast) {
                            currentToast.querySelector('.toast-text').textContent = 'Song uploaded successfully!';
                            currentToast.classList.add('success');
                            setTimeout(() => {
                                currentToast.classList.remove('expanded');
                                currentToast.style.animation = 'shrinkAndSlideUp 1s forwards';
                            }, 4000);
                            setTimeout(() => {
                                if (toastContainer.contains(currentToast)) {
                                    toastContainer.removeChild(currentToast);
                                    currentToast = null;
                                }
                            }, 5000);
                        }
                        uploadSongModal.classList.add('hidden');
                        uploadSongForm.reset();
                        loadTracks();
                    } else {
                        if (currentToast) {
                            toastContainer.removeChild(currentToast);
                            currentToast = null;
                        }
                        showToast(data.message || 'Error uploading song!', 'error');
                    }
                } catch (error) {
                    if (currentToast) {
                        toastContainer.removeChild(currentToast);
                        currentToast = null;
                    }
                    showToast('Error uploading song!', 'error');
                }
                songUploadXhr = null;
            };

            songUploadXhr.onerror = () => {
                progressBar.classList.add('hidden');
                if (currentToast) {
                    toastContainer.removeChild(currentToast);
                    currentToast = null;
                }
                showToast('Connection error during song upload!', 'error');
                songUploadXhr = null;
            };

            songUploadXhr.send(formData);
        } else {
            showToast('Select a valid MP3 file!', 'error');
        }
    });

    uploadBgBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to upload a background.', 'error');
            return;
        }
        loadBackgrounds();
        uploadBgModal.classList.remove('hidden');
    });

    cancelBgUpload.addEventListener('click', () => {
        uploadBgModal.classList.add('hidden');
        progressBar.classList.add('hidden');
        if (currentToast) {
            toastContainer.removeChild(currentToast);
            currentToast = null;
        }
    });

    uploadBgForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!apiBaseUrl) {
            await loadConfig();
        }
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to upload a background.', 'error');
            return;
        }
        const formData = new FormData(uploadBgForm);
        const fileInput = uploadBgForm.querySelector('input[type="file"]');
        const file = fileInput.files[0];

        if (file && file.type.startsWith('video/mp4')) {
            progressBar.classList.remove('hidden');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${apiBaseUrl}/background`, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    document.getElementById('progress-fill').style.width = `${percentComplete}%`;
                    showToast(`Uploading: ${Math.round(percentComplete)}%`, 'success', true);
                }
            };

            xhr.onload = () => {
                progressBar.classList.add('hidden');
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status === 200) {
                        if (currentToast) {
                            currentToast.querySelector('.toast-text').textContent = 'Background uploaded successfully!';
                            currentToast.classList.add('success');
                            setTimeout(() => {
                                currentToast.classList.remove('expanded');
                                currentToast.style.animation = 'shrinkAndSlideUp 1s forwards';
                            }, 4000);
                            setTimeout(() => {
                                if (toastContainer.contains(currentToast)) {
                                    toastContainer.removeChild(currentToast);
                                    currentToast = null;
                                }
                            }, 5000);
                        }
                        setBackground(data.url);
                        uploadBgModal.classList.add('hidden');
                        uploadBgForm.reset();
                        loadBackgrounds();
                    } else {
                        if (currentToast) {
                            toastContainer.removeChild(currentToast);
                            currentToast = null;
                        }
                        showToast(data.message || 'Error uploading background!', 'error');
                    }
                } catch (error) {
                    if (currentToast) {
                        toastContainer.removeChild(currentToast);
                        currentToast = null;
                    }
                    showToast('Error uploading background!', 'error');
                }
            };

            xhr.onerror = () => {
                progressBar.classList.add('hidden');
                if (currentToast) {
                    toastContainer.removeChild(currentToast);
                    currentToast = null;
                }
                showToast('Connection error during background upload!', 'error');
            };

            xhr.send(formData);
        } else {
            try {
                const response = await fetch(`${apiBaseUrl}/background`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                showToast(data.message || 'Background upload failed!', response.ok ? 'success' : 'error');
                if (response.ok) {
                    setBackground(data.url);
                    uploadBgModal.classList.add('hidden');
                    uploadBgForm.reset();
                    loadBackgrounds();
                }
            } catch (error) {
                showToast('Error uploading background!', 'error');
            }
        }
    });

    async function loadBackgrounds() {
    try {
        if (!apiBaseUrl) {
            await loadConfig();
        }
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to select a background.', 'error');
            return;
        }
        const response = await fetch(`${apiBaseUrl}/backgrounds`);
        const backgrounds = await response.json();
        bgItems.innerHTML = '';
        backgrounds.forEach(bg => {
            const bgItem = document.createElement('div');
            const url = `${apiBaseUrl}${bg.url}`;
            bgItem.innerHTML = bg.name.endsWith('.mp4') ? `<video src="${url}" muted></video>` : `<img src="${url}" alt="${bg.name}">`;
            bgItem.addEventListener('click', async () => {
                try {
                    const selectResponse = await fetch(`${apiBaseUrl}/select-background`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ background_url: bg.url })
                    });
                    const selectData = await selectResponse.json();
                    if (selectResponse.ok) {
                        setBackground(bg.url);
                        uploadBgModal.classList.add('hidden');
                        showToast(`Background selected: ${bg.name}`, 'success');
                    } else {
                        showToast(selectData.message || 'Error selecting background!', 'error');
                    }
                } catch (error) {
                    console.error('Error selecting background:', error);
                    showToast('Error selecting background!', 'error');
                }
            });
            bgItems.appendChild(bgItem);
        });
    } catch (error) {
        console.error('Error loading backgrounds:', error);
        showToast('Error loading backgrounds!', 'error');
    }
}

    function setBackground(url) {
    backgroundContainer.innerHTML = '';
    const fullUrl = `${apiBaseUrl}${url}`;
    if (url.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = fullUrl;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.onerror = () => {
            console.error('Error loading video background:', fullUrl);
            showToast('Failed to load video background!', 'error');
            backgroundContainer.innerHTML = '';
        };
        video.onloadeddata = () => {
            backgroundContainer.appendChild(video);
        };
    } else {
        const img = new Image();
        img.src = fullUrl;
        img.onerror = () => {
            console.error('Error loading image background:', fullUrl);
            showToast('Failed to load image background!', 'error');
            backgroundContainer.style.backgroundImage = '';
        };
        img.onload = () => {
            backgroundContainer.style.backgroundImage = `url('${fullUrl}')`;
        };
    }
}

    function createEqualizerSliders() {
        equalizerSliders.innerHTML = '';
        frequencies.forEach((freq, index) => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group flex flex-col items-center';
            const gainValue = filters[index] ? filters[index].gain.value : 0;
            sliderGroup.innerHTML = `
                <input type="range" min="-12" max="12" value="${gainValue}" step="0.1" data-index="${index}" class="w-full h-24 bg-gray-600 rounded-full appearance-none cursor-pointer vertical-slider">
                <span class="frequency-label text-xs text-gray-400">${freq >= 1000 ? freq / 1000 + 'k' : freq} Hz</span>
                <span class="gain-label text-xs text-gray-400">${gainValue} dB</span>
            `;
            const slider = sliderGroup.querySelector('input[type="range"]');
            const gainLabel = sliderGroup.querySelector('.gain-label');
            slider.addEventListener('input', (e) => {
                const gainValue = parseFloat(e.target.value);
                if (filters[index]) {
                    filters[index].gain.value = gainValue;
                    gainLabel.textContent = `${gainValue} dB`;
                }
            });
            equalizerSliders.appendChild(sliderGroup);
        });
    }

    function resetEqualizer() {
        if (filters.length === 0) {
            showToast('No filters to reset!', 'error');
            return;
        }
        filters.forEach((filter, index) => {
            filter.gain.value = 0;
            const slider = equalizerSliders.querySelector(`input[data-index="${index}"]`);
            if (slider) {
                slider.value = 0;
                const gainLabel = slider.nextElementSibling.nextElementSibling;
                if (gainLabel) {
                    gainLabel.textContent = '0 dB';
                }
            }
        });
        showToast('Equalizer reset successfully!', 'success');
    }

    function applyPreset(presetName) {
        if (filters.length === 0) {
            showToast('No filters to apply preset!', 'error');
            return;
        }
        const presetGains = equalizerPresetsData[presetName];
        if (presetGains) {
            filters.forEach((filter, index) => {
                const gainValue = presetGains[index] || 0;
                filter.gain.value = gainValue;
                const slider = equalizerSliders.querySelector(`input[data-index="${index}"]`);
                if (slider) {
                    slider.value = gainValue;
                    const gainLabel = slider.nextElementSibling.nextElementSibling;
                    if (gainLabel) {
                        gainLabel.textContent = `${gainValue} dB`;
                    }
                }
            });
            showToast(`Preset applied: ${presetName}`, 'success');
        } else {
            showToast(`Preset ${presetName} not found!`, 'error');
        }
    }

    function populatePresets() {
        equalizerPresets.innerHTML = '';
        for (const presetName in equalizerPresetsData) {
            const presetButton = document.createElement('button');
            presetButton.textContent = presetName;
            presetButton.className = 'preset-btn block w-full text-left py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-200';
            presetButton.addEventListener('click', () => {
                applyPreset(presetName);
                equalizerPresets.classList.remove('active');
            });
            equalizerPresets.appendChild(presetButton);
        }
    }

    function populateBitratePresets() {
        bitratePresets.innerHTML = '';
        bitrateOptions.forEach(option => {
            const bitrateButton = document.createElement('button');
            bitrateButton.textContent = option.name;
            bitrateButton.className = 'preset-btn block w-full text-left py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-200';
            bitrateButton.addEventListener('click', () => {
                applyBitrate(option.value);
                bitratePresets.classList.remove('active');
            });
            bitratePresets.appendChild(bitrateButton);
        });
    }

    function applyBitrate(bitrate) {
        if (currentTrackIndex >= 0 && currentTrackIndex < currentTracks.length && currentTracks[currentTrackIndex]) {
            const track = currentTracks[currentTrackIndex];
            const currentTime = audioPlayer.currentTime;
            const wasPlaying = isPlaying;

            const trackUrl = `${apiBaseUrl}${track.url}?bitrate=${bitrate}`;
            audioPlayer.src = trackUrl;
            audioPlayer.currentTime = currentTime;

            if (wasPlaying) {
                audioPlayer.play().then(() => {
                    isPlaying = true;
                    updatePlayPauseState();
                    showToast(`Bitrate set to ${bitrate} kbps`, 'success');
                }).catch(error => {
                    showToast('Cannot apply bitrate. Check server support.', 'error');
                });
            }

            setupAudioContext();
            if (waveEnabled && !analyser) {
                setupAnalyser(audioPlayer);
            }
            audioPlayer.volume = parseFloat(volumeSlider.value);
            if (gainNode) {
                gainNode.gain.value = parseFloat(volumeSlider.value);
            }
        } else {
            showToast('No track selected for bitrate!', 'error');
        }
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    loadSelectedBackground();
    loadTracks();
});

const img = document.getElementById('mini-thumbnail');

function checkImage() {
    if (!img.src || img.src.trim() === '' || img.naturalWidth === 0) {
        img.style.display = 'none';
    } else {
        img.style.display = 'inline-block';
    }
}

img.addEventListener('error', () => {
    img.style.display = 'none';
});

img.addEventListener('load', () => {
    checkImage();
});
if (img.complete) {
    checkImage();
}

const scrollBtn = document.getElementById('scroll-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        scrollBtn.classList.remove('opacity-0', 'pointer-events-none');
        scrollBtn.classList.add('opacity-100', 'show');
    } else {
        scrollBtn.classList.add('opacity-0', 'pointer-events-none');
        scrollBtn.classList.remove('opacity-100', 'show');
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const fileUploadContainer = document.querySelector('#upload-song-form');
const linkUploadContainer = document.querySelector('#link-upload-container');

const upWithLinkBtn = document.querySelector('#upwith-link-btn');
const backToFileBtn = document.querySelector('#back-to-file-upload');
const cancelLinkBtn = document.querySelector('#cancel-link-upload');

upWithLinkBtn.addEventListener('click', () => {
    fileUploadContainer.classList.add('hidden');
    linkUploadContainer.classList.remove('hidden');
});

backToFileBtn.addEventListener('click', () => {
    linkUploadContainer.classList.add('hidden');
    fileUploadContainer.classList.remove('hidden');
});

cancelLinkBtn.addEventListener('click', () => {
    linkUploadContainer.classList.add('hidden');
    fileUploadContainer.classList.remove('hidden');
    document.querySelector('#upload-song-modal').classList.add('hidden');
    if (currentToast) {
        toastContainer.removeChild(currentToast);
        currentToast = null;
    }
});

document.getElementById('project-btn').addEventListener('click', () => {
    window.location.href = 'p/p.html';
});

