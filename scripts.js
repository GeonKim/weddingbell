document.addEventListener('DOMContentLoaded', () => {

    // --- [기능 추가] 줌 제어 함수 시작 ---
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalContent = viewportMeta.getAttribute('content');

    // 줌 방지 (모달 열릴 때)
    const disableZoom = () => {
        // 1. 메타 태그 강제 설정 (Android 등 대응)
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        
        // 2. 터치 이벤트 리스너 추가 (iOS Safari 대응 - 핀치 줌 차단)
        document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    };

    // 줌 허용 (모달 닫힐 때)
    const enableZoom = () => {
        // 1. 메타 태그 원상복구
        viewportMeta.setAttribute('content', originalContent);
        
        // 2. 터치 이벤트 리스너 제거
        document.removeEventListener('touchmove', preventPinchZoom);
    };

    // 핀치 줌(손가락 두개) 감지 시 무시하는 함수
    const preventPinchZoom = (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    };
    // --- [기능 추가] 줌 제어 함수 끝 ---


    // --- 1. 갤러리 동적 생성 및 슬라이드 기능 ---
    const galleryContainer = document.getElementById('gallery-container');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn'); 
    const nextBtn = document.querySelector('.next-btn'); 

    let currentImageIndex = 0; 

    // ❗️ 실제 이미지 파일명 배열
    const imageFiles = [
        '1900_15695.jpg',
        '1900_15713.jpg',
        '1900_15685.jpg',
        '1900_15714.png',
        'main.png',
        '1900_15717.jpg',
        '1900_15723.jpg',
        '1900_15724.jpg',
        '1900_15731.jpg',
        'date1.jpg',
        'date2.jpg',
        'date3.jpg',
        'snap1.jpg',
        'snap2.jpg',
        'video2.gif',
    ];

    // 테스트용 (사용 안 함)
    const placeholderImages = [];

    const imagesToLoad = imageFiles.map(file => `images/${file}`);

    imagesToLoad.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('thumbnail');
        img.alt = "웨딩 사진";
        
        // 썸네일 클릭 시 모달 열기
        img.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImage.src = src;
            currentImageIndex = index;
            
            disableZoom(); // [추가] 줌 방지 실행
        });
        
        galleryContainer.appendChild(img);
    });

    // 모달 닫기 함수
    const closeModal = () => {
        modal.style.display = 'none';
        enableZoom(); // [추가] 줌 허용 실행
    }

    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    const showImage = (index) => {
        if (index < 0) {
            currentImageIndex = imagesToLoad.length - 1; 
        } else if (index >= imagesToLoad.length) {
            currentImageIndex = 0; 
        } else {
            currentImageIndex = index;
        }
        modalImage.src = imagesToLoad[currentImageIndex];
    };

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        showImage(currentImageIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        showImage(currentImageIndex + 1);
    });

    // --- 2. 카카오맵 연동 ---
    var container = document.getElementById('kakao-map'); 
    var options = { 
        center: new kakao.maps.LatLng(37.381654, 126.659911), 
        level: 3 
    };
    
    var map = new kakao.maps.Map(container, options);
    var markerPosition  = new kakao.maps.LatLng(37.381654, 126.659911); 

    var marker = new kakao.maps.Marker({
        position: markerPosition
    });

    marker.setMap(map);

    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    
    // --- 3. 계좌번호 복사 기능 (모든 버튼 통합) ---
    const accountButtons = document.querySelectorAll('.account-btn');

    accountButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // e.target 대신 e.currentTarget을 사용하여 이벤트가 걸린 버튼 자체를 확실하게 가져옵니다.
            const target = e.currentTarget; 
            
            const bank = target.dataset.bank;    // 예: 신랑, 신랑 아버지...
            const name = target.dataset.name;    // 예: 홍길동
            const account = target.dataset.account; // 예: 123-456...

            // 1. 이미 열려있는 버튼을 다시 클릭했을 때 (닫기 기능)
            if (target.classList.contains('active')) {
                target.classList.remove('active');
                target.innerText = `${bank} 계좌번호 보기`;
            } 
            // 2. 닫혀있는 버튼을 클릭했을 때 (열기 + 복사 기능)
            else {
                // 다른 모든 버튼을 초기화(닫기) 합니다.
                accountButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.innerText = `${btn.dataset.bank} 계좌번호 보기`;
                });

                // 현재 버튼 활성화 및 텍스트 변경
                target.classList.add('active');
                target.innerText = `${name} | ${account}`;

                // 계좌번호 복사 로직
                if (account) {
                    navigator.clipboard.writeText(account)
                        .then(() => {
                            // 복사 성공 시 알림
                            alert(`[${name}]님의 계좌번호가 복사되었습니다.\n${account}`);
                        })
                        .catch(err => {
                            console.error('계좌번호 복사 실패:', err);
                            alert('계좌번호 복사에 실패했습니다. 직접 입력해주세요.');
                        });
                } else {
                    alert('계좌번호 정보가 없습니다.');
                }
            }
        });
    });

    // --- 4. 배경음악 ON/OFF 토글 기능 ---
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmToggle = document.getElementById('bgm-toggle');

    bgmAudio.volume = 0.6;
    let isPlaying = true;

    function forcePlayBgm() {
        if (bgmAudio.paused) {
            bgmAudio.play().catch(() => {}); 
        }
    }
    window.addEventListener('DOMContentLoaded', forcePlayBgm);
    window.addEventListener('click', forcePlayBgm, { once: true });
    window.addEventListener('touchstart', forcePlayBgm, { once: true });

    function updateToggleBtn() {
        if (isPlaying) {
            bgmToggle.textContent = '🔊';
        } else {
            bgmToggle.textContent = '🔇';
        }
    }

    bgmToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgmAudio.pause();
        } else {
            bgmAudio.play();
        }
        isPlaying = !isPlaying;
        updateToggleBtn();
    });

    bgmAudio.addEventListener('pause', () => {
        isPlaying = false;
        updateToggleBtn();
    });
    bgmAudio.addEventListener('play', () => {
        isPlaying = true;
        updateToggleBtn();
    });

    document.body.addEventListener('touchstart', function oncePlay() {
        if (bgmAudio.paused) {
            bgmAudio.play();
        }
        document.body.removeEventListener('touchstart', oncePlay);
    });

});