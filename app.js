document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const appContainer = document.getElementById('app-container');
    const views = {
        setup: document.getElementById('setup-view'),
        main: document.getElementById('main-view'),
        dayList: document.getElementById('day-list-view'),
        search: document.getElementById('search-view'),
        detail: document.getElementById('detail-view'),
        quiz: document.getElementById('quiz-view'),
    };
    const fileInput = document.getElementById('file-input');
    const setupStatus = document.getElementById('setup-status');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const wordListContainer = document.getElementById('word-list-container');
    const flashcard = document.querySelector('.flashcard');
    const flashcardFront = document.getElementById('flashcard-front');
    const flashcardBack = document.getElementById('flashcard-back');
    const flashcardEng = document.getElementById('flashcard-eng');
    const flashcardKor = document.getElementById('flashcard-kor');
    const speakButton = document.getElementById('speak-button');
    const favoriteButton = document.getElementById('favorite-button');
    const prevCardBtn = document.getElementById('prev-card-btn');
    const nextCardBtn = document.getElementById('next-card-btn');
    const randomCardBtn = document.getElementById('random-card-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const increaseFontBtn = document.getElementById('increase-font-btn');
    const decreaseFontBtn = document.getElementById('decrease-font-btn');
    const fontSizeDisplay = document.getElementById('font-size-display');
    const increaseDaysBtn = document.getElementById('increase-days-btn');
    const decreaseDaysBtn = document.getElementById('decrease-days-btn');
    const daysDisplay = document.getElementById('days-display');
    const wordCountDisplay = document.getElementById('word-count-display');
    const studyBtn = document.getElementById('study-btn');
    const favoritesStudyBtn = document.getElementById('favorites-study-btn');
    const searchStartBtn = document.getElementById('search-start-btn');
    const quizBtn = document.getElementById('quiz-btn');
    const dayListContainer = document.getElementById('day-list-container');
    const dayListTitle = document.getElementById('day-list-title');
    const backToMainBtns = document.querySelectorAll('.back-to-main-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const addNewWordBtn = document.getElementById('add-new-word-btn');
    const addWordModal = document.getElementById('add-word-modal');
    const closeAddModalBtn = document.getElementById('close-add-modal-btn');
    const addWordForm = document.getElementById('add-word-form');
    const exportDataBtn = document.getElementById('export-data-btn');
    const quitQuizBtn = document.getElementById('quit-quiz-btn');
    const quizProgress = document.getElementById('quiz-progress');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizResultsModal = document.getElementById('quiz-results-modal');
    const quizScoreText = document.getElementById('quiz-score-text');
    const closeResultsModalBtn = document.getElementById('close-results-modal-btn');
    const toast = document.getElementById('toast');
    const flashcardProgress = document.getElementById('flashcard-progress');
    const studyOrderControls = document.getElementById('study-order-controls');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const quizAutoToggleControls = document.getElementById('quiz-auto-toggle-controls');
    const quizTimeControlContainer = document.getElementById('quiz-time-control-container');
    const decreaseQuizTimeBtn = document.getElementById('decrease-quiz-time-btn');
    const quizTimeDisplay = document.getElementById('quiz-time-display');
    const increaseQuizTimeBtn = document.getElementById('increase-quiz-time-btn');
    const editWordBtn = document.getElementById('edit-word-btn');
    const editWordModal = document.getElementById('edit-word-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const editWordForm = document.getElementById('edit-word-form');
    const editWordId = document.getElementById('edit-word-id');
    const editForeignInput = document.getElementById('edit-foreign-input');
    const editNativeInput = document.getElementById('edit-native-input');
    const editMemoInput = document.getElementById('edit-memo-input');
    const deleteWordBtn = document.getElementById('delete-word-btn');
    const decreaseCardRatioBtn = document.getElementById('decrease-card-ratio-btn');
    const cardRatioDisplay = document.getElementById('card-ratio-display');
    const increaseCardRatioBtn = document.getElementById('increase-card-ratio-btn');
    const toggleLangBtn = document.getElementById('toggle-lang-btn');
    const decreaseDashboardRatioBtn = document.getElementById('decrease-dashboard-ratio-btn');
    const dashboardRatioDisplay = document.getElementById('dashboard-ratio-display');
    const increaseDashboardRatioBtn = document.getElementById('increase-dashboard-ratio-btn');
    const importDataInput = document.getElementById('import-data-input');

    // 상태 변수
    let db, currentWord = null;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
    let totalDays = parseInt(localStorage.getItem('totalDays')) || 30;
    let studyPlan = JSON.parse(localStorage.getItem('studyPlan')) || null;
    let studyOrder = localStorage.getItem('studyOrder') || 'random';
    let quizAutoProceed = (localStorage.getItem('quizAutoProceed') || 'true') === 'true';
    let quizAutoProceedTime = parseInt(localStorage.getItem('quizAutoProceedTime')) || 1200;
    let currentCardRatio = parseFloat(localStorage.getItem('cardRatio')) || 1.25;
    let currentDashboardRatio = parseFloat(localStorage.getItem('dashboardRatio')) || 1.25;
    let completedDays = JSON.parse(localStorage.getItem('completedDays')) || [];
    let flashcardDirection = localStorage.getItem('flashcardDirection') || 'eng-kor';
    let currentSessionWords = [], currentWordIndex = 0, currentStudyDayKey = null;
    let touchStartX = 0, touchEndX = 0;
    let quizWords = [], quizCurrentIndex = 0, quizScore = 0;

    // 상수
    const DB_NAME = "MyStudyAppDB", STORE_NAME = "words", DB_VERSION = 4;

    // 뷰 렌더링 및 네비게이션 관리
    function navigateTo(view, data = {}, options = { replace: false }) {
        const state = { view, data };
        if (options.replace) {
            history.replaceState(state, '', `#${view}`);
        } else {
            history.pushState(state, '', `#${view}`);
        }
        renderViewForState(state);
    }

    async function renderViewForState(state) {
        if (!state) {
            state = { view: 'main', data: {} };
        }
        const { view, data } = state;

        Object.values(views).forEach(v => v.classList.add('hidden'));

        switch (view) {
            case 'main':
                views.main.classList.remove('hidden');
                break;
            case 'dayList':
                favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                await renderDayList(data.mode);
                views.dayList.classList.remove('hidden');
                break;
            case 'search':
                views.search.classList.remove('hidden');
                break;
            case 'detail':
                if (data.word) {
                    currentSessionWords = [data.word];
                    currentWordIndex = 0;
                } else if (data.dayKey && data.mode) {
                    await startFlashcardSession(data.dayKey, data.mode);
                }
                displayCurrentCard();
                views.detail.classList.remove('hidden');
                break;
            case 'quiz':
                await startQuizSession(data.dayKey);
                views.quiz.classList.remove('hidden');
                break;
            case 'setup':
                views.setup.classList.remove('hidden');
                break;
            default:
                views.main.classList.remove('hidden');
                break;
        }
    }
    
    window.addEventListener('popstate', (event) => {
        renderViewForState(event.state);
    });

    // IndexedDB 함수
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = e => reject("DB 열기 오류: " + e.target.errorCode);
            request.onsuccess = e => { db = e.target.result; resolve(db); };
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (db.objectStoreNames.contains(STORE_NAME)) { db.deleteObjectStore(STORE_NAME); }
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                store.createIndex("foreign_idx", "foreign", { unique: false });
                store.createIndex("native_idx", "native", { unique: false });
            };
        });
    }

    function importDataToDB(wordsData) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.clear();
            wordsData.forEach(word => {
                if (word.foreign && word.native) {
                    store.add({ foreign: word.foreign, native: word.native, memo: word.memo || "" });
                }
            });
            tx.oncomplete = () => resolve();
            tx.onerror = e => reject("데이터 저장 오류: " + e.target.error);
        });
    }

    async function createStudyPlan(days) {
        completedDays = [];
        localStorage.removeItem('completedDays');

        if (!db) return null;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const allKeysRequest = store.getAllKeys();
            allKeysRequest.onerror = e => reject("단어 ID 조회 오류: " + e.target.error);
            allKeysRequest.onsuccess = () => {
                const allIds = allKeysRequest.result;

                if (studyOrder === 'random') {
                    for (let i = allIds.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
                    }
                }
                
                const newPlan = {};
                const totalWords = allIds.length;
                const wordsPerDay = Math.ceil(totalWords / days);
                for (let i = 0; i < days; i++) {
                    const day = i + 1;
                    const startIndex = i * wordsPerDay;
                    const endIndex = startIndex + wordsPerDay;
                    const dayWordIds = allIds.slice(startIndex, endIndex);
                    if (dayWordIds.length > 0) newPlan[`DAY_${day}`] = dayWordIds;
                }
                studyPlan = newPlan;
                localStorage.setItem('studyPlan', JSON.stringify(studyPlan));
                localStorage.setItem('totalDays', days);
                resolve(newPlan);
            };
        });
    }
    
    // UI 렌더링 함수
    function renderDayList(mode) {
        dayListContainer.innerHTML = '';
        if (!studyPlan) {
            dayListContainer.innerHTML = `<p class="placeholder">학습 계획이 없습니다. 설정에서 학습 일수를 지정해주세요.</p>`;
            return;
        }
        const title = mode === 'study' ? '학습하기' : (mode === 'favorites' ? '즐겨찾기' : '퀴즈');
        dayListTitle.textContent = title;
        const fragment = document.createDocumentFragment();
        const dayKeys = Object.keys(studyPlan).sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));
        dayKeys.forEach(dayKey => {
            const dayNumber = dayKey.split('_')[1];
            const wordIdsInDay = studyPlan[dayKey];
            let displayCount;
            if (mode === 'favorites') {
                const favoriteCount = wordIdsInDay.filter(id => favorites.includes(id)).length;
                if (favoriteCount === 0) return;
                displayCount = favoriteCount;
            } else {
                displayCount = wordIdsInDay.length;
            }
            const item = document.createElement('div');
            item.className = 'day-item';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = `DAY ${dayNumber}`;

            const controlsContainer = document.createElement('div');
            controlsContainer.style.display = 'flex';
            controlsContainer.style.alignItems = 'center';

            if (mode === 'study' && completedDays.includes(dayKey)) {
                const checkIcon = document.createElement('i');
                checkIcon.className = 'fas fa-check-circle completed-check';
                controlsContainer.appendChild(checkIcon);
            }

            const countSpan = document.createElement('span');
            countSpan.className = 'day-item-count';
            countSpan.textContent = `${displayCount}개 단어`;
            controlsContainer.appendChild(countSpan);

            item.appendChild(textSpan);
            item.appendChild(controlsContainer);

            if (mode === 'favorites') {
                const clearFavsBtn = document.createElement('button');
                clearFavsBtn.className = 'btn';
                clearFavsBtn.textContent = '모두 해제';
                clearFavsBtn.style.marginLeft = '10px';
                clearFavsBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`DAY ${dayNumber}의 즐겨찾기를 모두 해제하시겠습니까?`)) {
                        clearFavoritesByDay(dayKey);
                    }
                };
                controlsContainer.appendChild(clearFavsBtn);
            }
            item.addEventListener('click', () => {
                if (mode === 'quiz') navigateTo('quiz', { dayKey });
                else navigateTo('detail', { dayKey, mode });
            });
            fragment.appendChild(item);
        });
        dayListContainer.appendChild(fragment);

        if (mode === 'favorites' && dayListContainer.children.length === 0) {
            dayListContainer.innerHTML = `<p class="placeholder">즐겨찾기한 단어가 없습니다.</p>`;
        }
    }

    function displayWords(words) {
        wordListContainer.innerHTML = '';
        if (words.length === 0) {
            wordListContainer.innerHTML = `<p class="placeholder">검색 결과가 없습니다.</p>`;
            return;
        }
        const fragment = document.createDocumentFragment();
        words.sort((a, b) => a.foreign.localeCompare(b.foreign)).forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';
            item.innerHTML = `<span class="word-item-eng">${word.foreign}</span><span class="word-item-kor">${word.native}</span>`;
            item.addEventListener('click', () => {
                navigateTo('detail', { word: word });
            });
            fragment.appendChild(item);
        });
        wordListContainer.appendChild(fragment);
    }
    
    // 학습/퀴즈 세션 함수
    async function startFlashcardSession(dayKey, mode) {
        currentStudyDayKey = dayKey;
        const wordIdsInDay = studyPlan[dayKey];
        let sessionWordIds;

        if (mode === 'favorites') {
            sessionWordIds = wordIdsInDay.filter(id => favorites.includes(id));
        } else {
            sessionWordIds = [...wordIdsInDay];
        }

        if (sessionWordIds.length === 0) {
            showToast("표시할 단어가 없습니다.");
            history.back();
            return;
        }

        if (studyOrder === 'sequential') {
            sessionWordIds.sort((a, b) => a - b);
        }
        
        currentSessionWords = await getWordsByIds(sessionWordIds);
        currentWordIndex = 0;
        
        if (studyOrder === 'random') {
            for (let i = currentSessionWords.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentSessionWords[i], currentSessionWords[j]] = [currentSessionWords[j], currentSessionWords[i]];
            }
        }
        randomCardBtn.classList.remove('active');
    }

    function displayCurrentCard() {
        if (!currentSessionWords || currentSessionWords.length === 0) return;
        currentWord = currentSessionWords[currentWordIndex];
        
        flashcardProgress.textContent = `${currentWordIndex + 1} / ${currentSessionWords.length}`;

        const memoText = currentWord.memo ? `\n\n[메모]\n${currentWord.memo}` : '';
        
        if (flashcardDirection === 'eng-kor') {
            flashcardEng.textContent = currentWord.foreign;
            flashcardKor.textContent = currentWord.native + memoText;
        } else {
            flashcardEng.textContent = currentWord.native;
            flashcardKor.textContent = currentWord.foreign + memoText;
        }

        flashcard.classList.remove('flipped');
        updateFavoriteButton();
        flashcardFront.scrollTop = 0;
        flashcardBack.scrollTop = 0;
    }
    
    async function startQuizSession(dayKey) {
        const wordIds = studyPlan[dayKey];
        if (wordIds.length < 5) {
            alert("퀴즈를 생성하려면 최소 5개의 단어가 필요합니다.");
            history.back();
            return;
        }
        quizWords = await getWordsByIds(wordIds);
        for (let i = quizWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [quizWords[i], quizWords[j]] = [quizWords[j], quizWords[i]];
        }
        quizCurrentIndex = 0;
        quizScore = 0;
        displayCurrentQuestion();
    }

    async function displayCurrentQuestion() {
        if (quizCurrentIndex >= quizWords.length) {
            showQuizResults();
            return;
        }
        nextQuestionBtn.classList.add('hidden');
        quizProgress.textContent = `${quizCurrentIndex + 1}/${quizWords.length}`;
        const currentQuestionWord = quizWords[quizCurrentIndex];
        quizQuestion.textContent = currentQuestionWord.foreign;
        const options = [currentQuestionWord.native];
        const allWords = await getAllWords();
        while (options.length < 5) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!options.includes(randomWord.native)) {
                options.push(randomWord.native);
            }
        }
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        quizOptions.innerHTML = '';
        options.forEach(optionText => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = optionText;
            btn.onclick = (e) => selectQuizOption(e.target, optionText === currentQuestionWord.native);
            quizOptions.appendChild(btn);
        });
    }

    function selectQuizOption(button, isCorrect) {
        document.querySelectorAll('.quiz-option-btn').forEach(btn => btn.disabled = true);
        if (isCorrect) {
            button.classList.add('correct');
            quizScore++;
        } else {
            button.classList.add('incorrect');
            document.querySelectorAll('.quiz-option-btn').forEach(btn => {
                if (btn.textContent === quizWords[quizCurrentIndex].native) {
                    btn.classList.add('correct');
                }
            });
        }

        if (quizAutoProceed) {
            setTimeout(() => {
                quizCurrentIndex++;
                displayCurrentQuestion();
            }, quizAutoProceedTime);
        } else {
            nextQuestionBtn.classList.remove('hidden');
        }
    }

    function showQuizResults() {
        quizScoreText.textContent = `${quizWords.length}개 중 ${quizScore}개 정답!`;
        quizResultsModal.classList.remove('hidden');
    }
    
    // 헬퍼 함수
    function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); }, 2000); }
    function applyFontSize() { document.documentElement.style.fontSize = `${currentFontSize}px`; fontSizeDisplay.textContent = `${currentFontSize}px`; localStorage.setItem('fontSize', currentFontSize); }
    async function updateDaysSetting() { daysDisplay.textContent = `${totalDays}일`; showToast(`${totalDays}일로 학습 계획을 다시 생성합니다...`); await createStudyPlan(totalDays); showToast('학습 계획 생성이 완료되었습니다!'); }
    function updateFavoriteButton() { if (!currentWord) return; if (favorites.includes(currentWord.id)) { favoriteButton.classList.add('favorited'); favoriteButton.innerHTML = '<i class="fas fa-star"></i>'; } else { favoriteButton.classList.remove('favorited'); favoriteButton.innerHTML = '<i class="far fa-star"></i>'; } }
    
    function showNextCard() {
        if (currentWordIndex < currentSessionWords.length - 1) {
            currentWordIndex++;
            displayCurrentCard();
        } else {
            if (currentStudyDayKey && !completedDays.includes(currentStudyDayKey)) {
                completedDays.push(currentStudyDayKey);
                localStorage.setItem('completedDays', JSON.stringify(completedDays));
                showToast(`DAY ${currentStudyDayKey.split('_')[1]} 학습 완료!`);

                if (studyPlan && completedDays.length === Object.keys(studyPlan).length) {
                    completedDays = [];
                    localStorage.removeItem('completedDays');
                    showToast('🎉 모든 학습 완료! 진행도가 초기화됩니다.');
                }
            } else {
                showToast('마지막 단어입니다.');
            }
        }
    }

    function showPrevCard() { if (currentWordIndex > 0) { currentWordIndex--; displayCurrentCard(); } else { showToast('첫 단어입니다.'); } }
    function handleSwipe() { const swipeThreshold = 50; if (touchEndX < touchStartX - swipeThreshold) { showNextCard(); } else if (touchEndX > touchStartX + swipeThreshold) { showPrevCard(); } }
    function getWordCount() { return new Promise((resolve) => { if (!db) return resolve(0); const tx = db.transaction(STORE_NAME, "readonly"); store = tx.objectStore(STORE_NAME); const countReq = store.count(); countReq.onsuccess = () => resolve(countReq.result); countReq.onerror = () => resolve(0); }); }
    function checkDBStatus() { return new Promise((resolve) => { if (!db) return resolve(false); const tx = db.transaction(STORE_NAME, "readonly"); store = tx.objectStore(STORE_NAME); const countReq = store.count(); countReq.onsuccess = () => resolve(countReq.result > 0); countReq.onerror = () => resolve(false); }); }
    function getAllWords() { return new Promise((resolve, reject) => { if (!db) return resolve([]); const tx = db.transaction(STORE_NAME, "readonly"); store = tx.objectStore(STORE_NAME); const req = store.getAll(); req.onsuccess = () => resolve(req.result); req.onerror = (e) => reject("전체 단어 조회 오류: " + e.target.error); }); }
    
    function getWordsByIds(ids) {
        return new Promise((resolve, reject) => {
            if (!db || ids.length === 0) return resolve([]);
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const results = new Array(ids.length);
            let processedCount = 0;

            if (ids.length === 0) {
                return resolve([]);
            }

            ids.forEach((id, index) => {
                const request = store.get(id);
                request.onsuccess = () => {
                    results[index] = request.result;
                    processedCount++;
                    if (processedCount === ids.length) {
                        resolve(results.filter(Boolean));
                    }
                };
                request.onerror = (e) => {
                    console.error(`ID ${id} 단어 조회 실패:`, e.target.error);
                    processedCount++;
                    if (processedCount === ids.length) {
                        resolve(results.filter(Boolean));
                    }
                };
            });
        });
    }

    function addWordToDB(word) { return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); store = tx.objectStore(STORE_NAME); const req = store.add(word); req.onsuccess = () => resolve(req.result); req.onerror = (e) => reject("단어 추가 오류: " + e.target.error); }); }
    function updateWordInDB(word) { return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); store = tx.objectStore(STORE_NAME); const req = store.put(word); req.onsuccess = resolve; req.onerror = (e) => reject("단어 수정 오류: " + e.target.error); }); }
    function deleteWordFromDB(id) { return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); store = tx.objectStore(STORE_NAME); const req = store.delete(id); req.onsuccess = resolve; req.onerror = (e) => reject("단어 삭제 오류: " + e.target.error); }); }
    function clearFavoritesByDay(dayKey) { const wordIdsInDay = studyPlan[dayKey]; const initialFavCount = favorites.length; favorites = favorites.filter(favId => !wordIdsInDay.includes(favId)); if (favorites.length < initialFavCount) { localStorage.setItem('favorites', JSON.stringify(favorites)); showToast(`DAY ${dayKey.split('_')[1]}의 즐겨찾기가 삭제되었습니다.`); renderDayList('favorites'); } }
    async function performSearch() { const term = searchInput.value.trim().toLowerCase(); if (!term) { displayWords([]); return; } const allWords = await getAllWords(); const filteredWords = allWords.filter(word => word.foreign.toLowerCase().includes(term) || word.native.toLowerCase().includes(term) || (word.memo && word.memo.toLowerCase().includes(term))); wordListContainer.scrollTop = 0; displayWords(filteredWords); }
    
    function applyCardRatio() {
        document.documentElement.style.setProperty('--card-aspect-ratio', currentCardRatio);
        cardRatioDisplay.textContent = currentCardRatio.toFixed(2);
        localStorage.setItem('cardRatio', currentCardRatio);
    }

    function applyDashboardRatio() {
        document.documentElement.style.setProperty('--dashboard-aspect-ratio', currentDashboardRatio);
        const fontScale = 0.85 + ((currentDashboardRatio - 0.8) / (2.0 - 0.8)) * 0.3;
        document.documentElement.style.setProperty('--dashboard-font-scale', fontScale);
        dashboardRatioDisplay.textContent = currentDashboardRatio.toFixed(2);
        localStorage.setItem('dashboardRatio', currentDashboardRatio);
    }

    // 이벤트 리스너
    studyBtn.addEventListener('click', () => navigateTo('dayList', { mode: 'study' }));
    favoritesStudyBtn.addEventListener('click', () => navigateTo('dayList', { mode: 'favorites' }));
    searchStartBtn.addEventListener('click', () => navigateTo('search'));
    quizBtn.addEventListener('click', () => navigateTo('dayList', { mode: 'quiz' }));
    
    backToMainBtns.forEach(btn => btn.addEventListener('click', () => history.back()));
    backToListBtn.addEventListener('click', () => history.back());

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setupStatus.textContent = '파일을 읽는 중...';
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const wordsData = JSON.parse(e.target.result);
                setupStatus.textContent = `총 ${wordsData.length.toLocaleString()}개 단어 저장 중...`;
                await importDataToDB(wordsData);
                
                showToast('✅ 설정 완료! 앱을 시작합니다.');
                await createStudyPlan(totalDays);
                navigateTo('main', {}, { replace: true });

            } catch (err) {
                setupStatus.textContent = '오류: 올바른 JSON 파일이 아닙니다.';
            }
        };
        reader.readAsText(file);
    });

    searchInput.addEventListener('input', () => { clearSearchBtn.classList.toggle('hidden', searchInput.value.length === 0); performSearch(); });
    clearSearchBtn.addEventListener('click', () => { searchInput.value = ''; clearSearchBtn.classList.add('hidden'); displayWords([]); });
    flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
    nextCardBtn.addEventListener('click', showNextCard);
    prevCardBtn.addEventListener('click', showPrevCard);
    randomCardBtn.addEventListener('click', () => { randomCardBtn.classList.toggle('active'); for (let i = currentSessionWords.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [currentSessionWords[i], currentSessionWords[j]] = [currentSessionWords[j], currentSessionWords[i]]; } currentWordIndex = 0; displayCurrentCard(); showToast('단어를 무작위로 섞었습니다.'); });
    flashcard.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
    flashcard.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); });
    
    favoriteButton.addEventListener('click', () => {
        const wordId = currentWord.id;
        const index = favorites.indexOf(wordId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            showToast('즐겨찾기에서 삭제되었습니다.');
        } else {
            favorites.push(wordId);
            showToast('즐겨찾기에 추가되었습니다.');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoriteButton();

        if (index > -1 && document.getElementById('day-list-title').textContent === '즐겨찾기') {
            const sessionIndex = currentSessionWords.findIndex(word => word.id === wordId);
            if (sessionIndex > -1) {
                currentSessionWords.splice(sessionIndex, 1);
                
                if (currentSessionWords.length === 0) {
                    showToast('이 Day의 즐겨찾기 단어가 모두 해제되었습니다.');
                    history.back();
                    return;
                }
                if (currentWordIndex >= currentSessionWords.length) {
                    currentWordIndex = currentSessionWords.length - 1;
                }
                displayCurrentCard();
            }
        }
    });

    speakButton.addEventListener('click', () => { if (currentWord && 'speechSynthesis' in window) { const utterance = new SpeechSynthesisUtterance(currentWord.foreign); utterance.lang = 'en-US'; window.speechSynthesis.speak(utterance); } });
    settingsBtn.addEventListener('click', async () => { const count = await getWordCount(); wordCountDisplay.textContent = `${count.toLocaleString()}개 단어`; settingsModal.classList.remove('hidden'); });
    closeModalBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });
    increaseFontBtn.addEventListener('click', () => { currentFontSize = Math.min(45, currentFontSize + 1); applyFontSize(); });
    decreaseFontBtn.addEventListener('click', () => { currentFontSize = Math.max(12, currentFontSize - 1); applyFontSize(); });
    increaseDaysBtn.addEventListener('click', () => { totalDays = Math.min(365, totalDays + 1); updateDaysSetting(); });
    decreaseDaysBtn.addEventListener('click', () => { totalDays = Math.max(1, totalDays - 1); updateDaysSetting(); });
    addNewWordBtn.addEventListener('click', () => addWordModal.classList.remove('hidden'));
    closeAddModalBtn.addEventListener('click', () => addWordModal.classList.add('hidden'));
    addWordModal.addEventListener('click', (e) => { if (e.target === addWordModal) addWordModal.classList.add('hidden'); });
    
    addWordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newWord = {
            foreign: document.getElementById('foreign-input').value.trim(),
            native: document.getElementById('native-input').value.trim(),
            memo: document.getElementById('memo-input').value.trim()
        };
        if (!newWord.foreign || !newWord.native) return;

        const wordCountBeforeAdd = await getWordCount();
        const newWordId = await addWordToDB(newWord);
        
        addWordForm.reset();
        addWordModal.classList.add('hidden');
        showToast('새 단어가 추가되었습니다.');

        if (studyPlan) {
            const dayKeys = Object.keys(studyPlan).sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));
            let lastDayKey = dayKeys.length > 0 ? dayKeys[dayKeys.length - 1] : 'DAY_1';
            
            if (!studyPlan[lastDayKey]) studyPlan[lastDayKey] = [];
            
            const wordsPerDayThreshold = Math.ceil(wordCountBeforeAdd / (dayKeys.length || 1));

            if (dayKeys.length > 0 && studyPlan[lastDayKey].length >= wordsPerDayThreshold) {
                const lastDayNum = parseInt(lastDayKey.split('_')[1]);
                const newDayKey = `DAY_${lastDayNum + 1}`;
                lastDayKey = newDayKey;
                studyPlan[lastDayKey] = [];

                const staleIndex = completedDays.indexOf(newDayKey);
                if (staleIndex > -1) {
                    completedDays.splice(staleIndex, 1);
                    localStorage.setItem('completedDays', JSON.stringify(completedDays));
                }
            }
            
            studyPlan[lastDayKey].push(newWordId);
            localStorage.setItem('studyPlan', JSON.stringify(studyPlan));
        } else {
            await createStudyPlan(totalDays);
        }
        
        const count = await getWordCount();
        wordCountDisplay.textContent = `${count.toLocaleString()}개 단어`;
    });

    importDataInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const wordsData = JSON.parse(e.target.result);
                if (!Array.isArray(wordsData)) throw new Error("Invalid format");
                
                showToast(`총 ${wordsData.length.toLocaleString()}개 단어 불러오는 중...`);
                await importDataToDB(wordsData);
                await createStudyPlan(totalDays);
                
                const count = await getWordCount();
                wordCountDisplay.textContent = `${count.toLocaleString()}개 단어`;
                settingsModal.classList.add('hidden');
                showToast('✅ 데이터 불러오기 완료!');
                
            } catch (err) {
                alert('오류: 올바른 JSON 파일이 아니거나 파일이 손상되었습니다.');
            } finally {
                importDataInput.value = '';
            }
        };
        reader.readAsText(file);
    });

    exportDataBtn.addEventListener('click', async () => { const allWords = await getAllWords(); if (allWords.length === 0) { showToast('내보낼 데이터가 없습니다.'); return; } const exportData = allWords.map(({ id, ...rest }) => rest); const jsonString = JSON.stringify(exportData, null, 2); const blob = new Blob([jsonString], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `my_wordbook_export_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); });
    
    editWordBtn.addEventListener('click', () => {
        if (!currentWord) return;
        editWordId.value = currentWord.id;
        editForeignInput.value = currentWord.foreign;
        editNativeInput.value = currentWord.native;
        editMemoInput.value = currentWord.memo || '';
        editWordModal.classList.remove('hidden');
    });

    closeEditModalBtn.addEventListener('click', () => editWordModal.classList.add('hidden'));
    editWordModal.addEventListener('click', (e) => { if (e.target === editWordModal) editWordModal.classList.add('hidden'); });

    editWordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedWord = {
            id: parseInt(editWordId.value),
            foreign: editForeignInput.value.trim(),
            native: editNativeInput.value.trim(),
            memo: editMemoInput.value.trim()
        };
        if (!updatedWord.foreign || !updatedWord.native) return;

        await updateWordInDB(updatedWord);
        
        const indexInSession = currentSessionWords.findIndex(w => w.id === updatedWord.id);
        if (indexInSession > -1) {
            currentSessionWords[indexInSession] = updatedWord;
        }

        displayCurrentCard();
        editWordModal.classList.add('hidden');
        showToast('단어 정보가 수정되었습니다.');
    });

    deleteWordBtn.addEventListener('click', async () => {
        if (confirm(`'${currentWord.foreign}' 단어를 정말로 삭제하시겠습니까?`)) {
            const wordIdToDelete = currentWord.id;
            
            await deleteWordFromDB(wordIdToDelete);

            for (const dayKey in studyPlan) {
                const index = studyPlan[dayKey].indexOf(wordIdToDelete);
                if (index > -1) {
                    studyPlan[dayKey].splice(index, 1);
                    if (studyPlan[dayKey].length === 0) {
                        delete studyPlan[dayKey];
                    }
                    break;
                }
            }
            localStorage.setItem('studyPlan', JSON.stringify(studyPlan));
            editWordModal.classList.add('hidden');
            showToast('단어가 삭제되었습니다.');

            const sessionIndex = currentSessionWords.findIndex(word => word.id === wordIdToDelete);
            if (sessionIndex > -1) {
                currentSessionWords.splice(sessionIndex, 1);
                
                if (currentSessionWords.length === 0) {
                    showToast('이 세션의 마지막 단어가 삭제되었습니다.');
                    history.back();
                    return;
                }
                if (currentWordIndex >= currentSessionWords.length) {
                    currentWordIndex = currentSessionWords.length - 1;
                }
                displayCurrentCard();
            } else {
                history.back();
            }
        }
    });

    function updateStudyOrderUI() {
        studyOrderControls.querySelectorAll('.btn').forEach(btn => {
            btn.classList.toggle('btn-primary', btn.dataset.order === studyOrder);
        });
    }

    studyOrderControls.addEventListener('click', async (e) => {
        const selectedOrder = e.target.dataset.order;
        if (selectedOrder && selectedOrder !== studyOrder) {
            studyOrder = selectedOrder;
            localStorage.setItem('studyOrder', studyOrder);
            updateStudyOrderUI();
            const orderText = selectedOrder === 'random' ? '무작위 배분' : '입력 순서대로';
            showToast(`학습 순서를 '${orderText}'(으)로 변경하고 계획을 다시 생성합니다.`);
            await createStudyPlan(totalDays);
            showToast('학습 계획 생성이 완료되었습니다!');
        }
    });

    function updateQuizSettingsUI() {
        quizAutoToggleControls.querySelectorAll('.btn').forEach(btn => {
            btn.classList.toggle('btn-primary', JSON.parse(btn.dataset.value) === quizAutoProceed);
        });
        quizTimeControlContainer.style.display = quizAutoProceed ? 'block' : 'none';
        quizTimeDisplay.textContent = `${(quizAutoProceedTime / 1000).toFixed(1)}s`;
    }

    quizAutoToggleControls.addEventListener('click', (e) => {
        const value = e.target.dataset.value;
        if (value) {
            quizAutoProceed = JSON.parse(value);
            localStorage.setItem('quizAutoProceed', quizAutoProceed);
            updateQuizSettingsUI();
            showToast(quizAutoProceed ? '퀴즈 자동 진행이 켜졌습니다.' : '퀴즈 수동 진행으로 변경되었습니다.');
        }
    });

    decreaseQuizTimeBtn.addEventListener('click', () => {
        quizAutoProceedTime = Math.max(500, quizAutoProceedTime - 100);
        localStorage.setItem('quizAutoProceedTime', quizAutoProceedTime);
        updateQuizSettingsUI();
    });

    increaseQuizTimeBtn.addEventListener('click', () => {
        quizAutoProceedTime = Math.min(5000, quizAutoProceedTime + 100);
        localStorage.setItem('quizAutoProceedTime', quizAutoProceedTime);
        updateQuizSettingsUI();
    });

    nextQuestionBtn.addEventListener('click', () => {
        quizCurrentIndex++;
        displayCurrentQuestion();
    });

    decreaseCardRatioBtn.addEventListener('click', () => {
        currentCardRatio = Math.max(0.8, currentCardRatio - 0.05);
        applyCardRatio();
    });

    increaseCardRatioBtn.addEventListener('click', () => {
        currentCardRatio = Math.min(2.0, currentCardRatio + 0.05);
        applyCardRatio();
    });

    decreaseDashboardRatioBtn.addEventListener('click', () => {
        currentDashboardRatio = Math.max(0.8, currentDashboardRatio - 0.05);
        applyDashboardRatio();
    });

    increaseDashboardRatioBtn.addEventListener('click', () => {
        currentDashboardRatio = Math.min(2.0, currentDashboardRatio + 0.05);
        applyDashboardRatio();
    });

    toggleLangBtn.addEventListener('click', () => {
        flashcardDirection = (flashcardDirection === 'eng-kor') ? 'kor-eng' : 'eng-kor';
        localStorage.setItem('flashcardDirection', flashcardDirection);
        toggleLangBtn.classList.toggle('active', flashcardDirection === 'kor-eng');
        displayCurrentCard();
        showToast(flashcardDirection === 'eng-kor' ? '방향: 영 → 한' : '방향: 한 → 영');
    });

    resetDataBtn.addEventListener('click', async () => { if (confirm('정말로 모든 단어와 즐겨찾기 데이터를 삭제하시겠습니까?')) { await db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear(); localStorage.clear(); showToast('모든 데이터가 초기화되었습니다.'); location.reload(); } });
    quitQuizBtn.addEventListener('click', () => { if (confirm('퀴즈를 중단하고 나가시겠습니까?')) { history.back(); } });
    closeResultsModalBtn.addEventListener('click', () => { quizResultsModal.classList.add('hidden'); history.back(); });

    // 초기화
    async function init() {
        applyFontSize();
        applyCardRatio();
        applyDashboardRatio();
        daysDisplay.textContent = `${totalDays}일`;
        updateStudyOrderUI();
        updateQuizSettingsUI();
        toggleLangBtn.classList.toggle('active', flashcardDirection === 'kor-eng');
        try {
            await openDB();
            const isDataReady = await checkDBStatus();
            
            if (history.state === null) {
                if (isDataReady) {
                    const wordCount = await getWordCount();
                    const planWordCount = studyPlan ? Object.values(studyPlan).flat().length : 0;
                    if (!studyPlan || wordCount !== planWordCount) {
                        console.log("학습 계획이 유효하지 않아 새로 생성합니다.");
                        await createStudyPlan(totalDays);
                    }
                    navigateTo('main', {}, { replace: true });
                } else {
                    navigateTo('setup', {}, { replace: true });
                }
            } else {
                renderViewForState(history.state);
            }
        } catch (error) {
            alert("앱 초기화 오류: " + error);
        }
    }

    init();
});