document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 갤러리 동적 생성 및 슬라이드 기능 추가 ---
    const galleryContainer = document.getElementById('gallery-container');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn'); // 새로 추가
    const nextBtn = document.querySelector('.next-btn'); // 새로 추가

    let currentImageIndex = 0; // 현재 모달에 표시된 이미지의 인덱스

    // ❗️ 여기에 'images/' 폴더에 넣은 사진 파일명을 순서대로 입력하세요.
    const imageFiles = [
        '1900_15713.jpg',
        '1900_15728.jpg',
        '1900_15717.jpg',
        '1900_15695.jpg',
        '1900_15714.png',
        '1900_15723.jpg',
        '1900_15724.jpg',
        '1900_15731.jpg',
        'snap1.jpg',
    ];

    // (테스트용 임시 이미지 - 실제 사용 시 위 imageFiles 배열을 사용하세요)
    const placeholderImages = [
        'https://via.placeholder.com/400x400?text=Photo+1',
        'https://via.placeholder.com/400x400?text=Photo+2',
        'https://via.placeholder.com/400x400?text=Photo+3',
        'https://via.placeholder.com/400x400?text=Photo+4',
        'https://via.placeholder.com/400x400?text=Photo+5',
        'https://via.placeholder.com/400x400?text=Photo+6',
    ];

    // ❗️ 실제 사용 시 이 부분을 imageFiles로 변경하세요.
    const imagesToLoad = imageFiles.map(file => `images/${file}`);
    // const imagesToLoad = placeholderImages; // 테스트용

    imagesToLoad.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('thumbnail');
        img.alt = "웨딩 사진";
        
        // 썸네일 클릭 시 모달 열기
        img.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImage.src = src;
            currentImageIndex = index; // 현재 클릭된 이미지의 인덱스 저장
        });
        
        galleryContainer.appendChild(img);
    });

    // 모달 닫기
    const closeModal = () => {
        modal.style.display = 'none';
    }
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // 이미지 바깥(배경)을 클릭해도 닫히도록
        // 단, 화살표 버튼이나 이미지 자체 클릭은 제외
        if (e.target === modal) {
            closeModal();
        }
    });

    // 이미지 변경 함수
    const showImage = (index) => {
        if (index < 0) {
            currentImageIndex = imagesToLoad.length - 1; // 마지막 이미지로 이동
        } else if (index >= imagesToLoad.length) {
            currentImageIndex = 0; // 첫 번째 이미지로 이동
        } else {
            currentImageIndex = index;
        }
        modalImage.src = imagesToLoad[currentImageIndex];
    };

    // 이전 버튼 클릭
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 모달 닫힘 방지
        showImage(currentImageIndex - 1);
    });

    // 다음 버튼 클릭
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 모달 닫힘 방지
        showImage(currentImageIndex + 1);
    });

    // --- 2. 카카오맵 연동 ---
    var container = document.getElementById('kakao-map'); //지도를 담을 영역의 DOM 레퍼런스
    var options = { //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng(37.381654, 126.659911), //지도의 중심좌표.
        level: 3 //지도의 레벨(확대, 축소 정도)
    };
    
    var map = new kakao.maps.Map(container, options);
    var markerPosition  = new kakao.maps.LatLng(37.381654, 126.659911); 

    var marker = new kakao.maps.Marker({
        position: markerPosition
    });

    marker.setMap(map);

    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    
    // --- 3. 계좌번호 복사 기능 --- (이전과 동일)
    const accountButtons = document.querySelectorAll('.account-btn');

    accountButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target;
            const bank = target.dataset.bank; // 신랑, 신부
            const name = target.dataset.name;
            const account = target.dataset.account;
            
            // 토글 기능: 버튼 텍스트 변경
            if (target.classList.contains('active')) {
                // 이미 활성화된 상태 -> 다시 누르면 원상태로
                target.innerText = `${bank}측 계좌번호 보기`;
                target.classList.remove('active');
            } else {
                // 비활성화 상태 -> 계좌번호 표시 및 복사
                // 모든 버튼 비활성화
                accountButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.innerText = `${btn.dataset.bank}측 계좌번호 보기`;
                });
                
                // 현재 버튼 활성화
                target.classList.add('active');
                target.innerText = `${name} | ${account} (클릭하여 복사)`;
                
                // 클립보드에 복사
                navigator.clipboard.writeText(account)
                    .then(() => {
                        alert(`[${name}]님의 계좌번호가 복사되었습니다.\n${account}`);
                    })
                    .catch(err => {
                        console.error('계좌번호 복사 실패:', err);
                        alert('계좌번호 복사에 실패했습니다.');
                    });
            }
        });
    });

    // --- 4. 배경음악 ON/OFF 토글 기능 ---
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmToggle = document.getElementById('bgm-toggle');

    bgmAudio.volume = 0.6;
    let isPlaying = true;

    // 최초 접속시 무조건 재생 시도(모바일/데스크톱 모두) - 브라우저 차단에 대응
    function forcePlayBgm() {
        if (bgmAudio.paused) {
            bgmAudio.play().catch(() => {}); // 재생 차단 무시
        }
    }
    window.addEventListener('DOMContentLoaded', forcePlayBgm);
    window.addEventListener('click', forcePlayBgm, { once: true });
    window.addEventListener('touchstart', forcePlayBgm, { once: true });

    // 토글 버튼 작동: 🔊/🔇 이모지와 상태 텍스트 동시 전환
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

    // 오디오 정지 이벤트에도 버튼 상태 동기화
    bgmAudio.addEventListener('pause', () => {
        isPlaying = false;
        updateToggleBtn();
    });
    bgmAudio.addEventListener('play', () => {
        isPlaying = true;
        updateToggleBtn();
    });

    // (모바일 첫 터치 시도는 유지)
    document.body.addEventListener('touchstart', function oncePlay() {
        if (bgmAudio.paused) {
            bgmAudio.play();
        }
        document.body.removeEventListener('touchstart', oncePlay);
    });

});