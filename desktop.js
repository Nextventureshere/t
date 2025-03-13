let gender = 'male'; // Standardmäßig männlich

function switchMode(mode) {
    const modes = ['live-translation', 'translations', 'smart-query', 'document-translation'];
    modes.forEach(m => {
        const element = document.getElementById(m);
        const btn = document.getElementById(`${m}-btn`);
        if (element && btn) {
            if (m === mode) {
                element.classList.remove('hidden');
                btn.classList.add('active-btn');
            } else {
                element.classList.add('hidden');
                btn.classList.remove('active-btn');
            }
        }
    });
}

function selectGender(selectedGender) {
    gender = selectedGender;
    document.getElementById('gender-male').classList.toggle('gender-selected', selectedGender === 'male');
    document.getElementById('gender-female').classList.toggle('gender-selected', selectedGender === 'female');
}

function translate(source) {
    const inputText = source === 'doctor' ? document.getElementById('doctor-input').value : document.getElementById('patient-input').value;
    const sourceLanguage = source === 'doctor' ? document.getElementById('doctor-language').value : document.getElementById('patient-language').value;
    const targetLanguage = source === 'doctor' ? document.getElementById('patient-language').value : document.getElementById('doctor-language').value;
    const targetField = source === 'doctor' ? 'patient-input' : 'doctor-input';

    // Simulierter API-Aufruf (später durch echten API-Aufruf ersetzen)
    const translatedText = "API Fehler Platzhalter"; // Platzhalter, da keine API vorhanden
    document.getElementById(targetField).value = translatedText;

    // Gesprächsverlauf aktualisieren
    addToConversationLog(source, inputText, translatedText, sourceLanguage, targetLanguage);
}

function addToConversationLog(source, original, translated, sourceLang, targetLang) {
    const log = document.getElementById('conversation-log');
    const entry = document.createElement('div');
    entry.classList.add('conversation-entry', 'mb-2');
    const speaker = source === 'doctor' ? 'Arzt' : (gender === 'male' ? 'Patient' : 'Patientin');
    entry.innerHTML = `<strong>${speaker} (${sourceLang}):</strong> ${original}<br><strong>Übersetzung (${targetLang}):</strong> ${translated}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function playText(fieldId) {
    const text = document.getElementById(fieldId).value;
    if (text) {
        alert(`Vorlesen: "${text}"`); // Simuliert das Abspielen
    }
}

function newConversation() {
    document.getElementById('doctor-input').value = '';
    document.getElementById('patient-input').value = '';
    document.getElementById('conversation-log').innerHTML = '';
}

// Initialisierung
switchMode('live-translation');
selectGender('male');

// Globale Variablen
let phrases = [];
let translatedPhrases = [];
let categories = [];
let currentLanguage = 'de';
let autoQueries = [];
let currentQuery = null;
let currentPhraseIndex = 0;
let answers = [];

async function loadData() {
    const phrasesResponse = await fetch('phrases.json');
    phrases = await phrasesResponse.json();
    const phrasesEnResponse = await fetch('phrases_en.json');
    translatedPhrases = await phrasesEnResponse.json();
    const categoriesResponse = await fetch('categories.json');
    categories = await categoriesResponse.json();
    renderPhraseList();
}

function renderPhraseList() {
    const phraseList = document.getElementById('phrase-list');
    phraseList.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-card', 'bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'cursor-pointer', 'mb-4');
        categoryElement.innerHTML = `
            <div class="flex items-center space-x-4">
                <i class="${category.icon} text-2xl text-gray-700"></i>
                <h3 class="text-xl font-bold">${category.name}</h3>
            </div>
        `;
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('hidden', 'mt-4', 'space-y-4');

        if (category.subcategories) {
            category.subcategories.forEach(subcategory => {
                const subcategoryElement = document.createElement('div');
                subcategoryElement.classList.add('subcategory-card', 'bg-gray-100', 'p-4', 'rounded-lg', 'shadow-md', 'cursor-pointer');
                subcategoryElement.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <i class="${subcategory.icon} text-xl text-gray-700"></i>
                        <h4 class="text-lg font-semibold">${subcategory.name}</h4>
                    </div>
                `;
                const subContent = document.createElement('div');
                subContent.classList.add('hidden', 'mt-4', 'space-y-2');
                subcategory.phrases.forEach(phraseId => {
                    const phrase = phrases.find(p => p.id === phraseId);
                    if (phrase) {
                        const phraseElement = createPhraseElement(phrase);
                        subContent.appendChild(phraseElement);
                    }
                });
                subcategoryElement.appendChild(subContent);
                subcategoryElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    subContent.classList.toggle('hidden');
                });
                contentDiv.appendChild(subcategoryElement);
            });
        } else {
            category.phrases.forEach(phraseId => {
                const phrase = phrases.find(p => p.id === phraseId);
                if (phrase) {
                    const phraseElement = createPhraseElement(phrase);
                    contentDiv.appendChild(phraseElement);
                }
            });
        }
        categoryElement.appendChild(contentDiv);
        categoryElement.addEventListener('click', () => contentDiv.classList.toggle('hidden'));
        phraseList.appendChild(categoryElement);
    });
}

function createPhraseElement(phrase) {
    const translatedPhrase = translatedPhrases.find(p => p.id === phrase.id);
    const phraseElement = document.createElement('div');
    phraseElement.classList.add('phrase-card', 'bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'cursor-pointer', 'flex', 'items-center', 'justify-between');
    phraseElement.innerHTML = `
        <div class="flex items-center space-x-4">
            <i class="${phrase.icon} text-2xl text-gray-700"></i>
            <div>
                <p class="text-gray-700 font-semibold">${phrase.phrase}</p>
                <p class="text-gray-500 text-sm">${currentLanguage === 'en' && translatedPhrase ? translatedPhrase.phrase : phrase.phrase}</p>
            </div>
        </div>
        <button class="play-btn bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"><i class="fas fa-play"></i></button>
    `;
    phraseElement.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        playPhrase(phrase.phrase); // Platzhalterfunktion
    });
    phraseElement.addEventListener('click', () => showPhrasePopup(phrase));
    return phraseElement;
}

function showPhrasePopup(phrase) {
    const popup = document.getElementById('phrase-popup');
    const translatedPhrase = document.getElementById('popup-translated-phrase');
    const originalPhrase = document.getElementById('popup-original-phrase');
    const answers = document.getElementById('popup-answers');

    const translated = translatedPhrases.find(p => p.id === phrase.id);
    translatedPhrase.textContent = translated.phrase;
    originalPhrase.textContent = phrase.phrase;

    answers.innerHTML = '';
    translated.answers.forEach(answer => {
        const answerElement = document.createElement('div');
        answerElement.classList.add('flex', 'items-center', 'justify-between', 'bg-gray-100', 'p-4', 'rounded-lg', 'shadow-md');
        answerElement.innerHTML = `
            <p class="text-lg font-semibold text-gray-700">${answer}</p>
            <button class="play-answer bg-green-500 text-white p-2 rounded-full hover:bg-green-600"><i class="fas fa-play"></i></button>
        `;
        answerElement.querySelector('.play-answer').addEventListener('click', () => playPhrase(answer));
        answerElement.addEventListener('click', () => {
            answerElement.classList.add('bg-green-200');
            setTimeout(() => popup.classList.add('hidden'), 500);
        });
        answers.appendChild(answerElement);
    });

    document.getElementById('play-question').onclick = () => playPhrase(translated.phrase);
    popup.classList.remove('hidden');
}

function playPhrase(phrase) {
    console.log(`Abspielen: ${phrase}`); // Platzhalter für Abspielfunktion
}

document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('phrase-popup').classList.add('hidden');
});

document.getElementById('language-select').addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    renderPhraseList(); // Liste neu rendern mit aktueller Sprache
});

document.getElementById('search-input').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredPhrases = phrases.filter(p => p.phrase.toLowerCase().includes(searchTerm));
    // Hier könnte man eine gefilterte Liste rendern (optional)
});

// Initialisierung
loadData();

// Lade Daten für Smart Query
async function loadAutoQueries() {
    const response = await fetch('auto.json');
    autoQueries = await response.json();
    renderQueryList();
}

// Render die Abfrage-Liste
function renderQueryList() {
    const queryList = document.getElementById('query-list');
    queryList.innerHTML = '';
    autoQueries.forEach(query => {
        const queryElement = document.createElement('div');
        queryElement.classList.add('query-card', 'bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'cursor-pointer', 'flex', 'items-center', 'space-x-4');
        queryElement.innerHTML = `
            <i class="${query.icon} text-3xl text-gray-700"></i>
            <div>
                <h3 class="text-xl font-bold text-gray-800">${query.title}</h3>
                <p class="text-gray-500">${query.description}</p>
            </div>
        `;
        queryElement.addEventListener('click', () => startQuery(query));
        queryList.appendChild(queryElement);
    });
}

// Starte eine Abfrage
function startQuery(query) {
    currentQuery = query;
    currentPhraseIndex = 0;
    answers = []; // Antworten zurücksetzen
    document.getElementById('popup-content').classList.remove('hidden'); // Inhalt anzeigen
    document.getElementById('summary-content').classList.add('hidden');  // Zusammenfassung verstecken
    showPhrase(currentPhraseIndex);
}

// Hilfsfunktion: Deutsche Antwort abrufen
function getGermanAnswer(phrase, translatedAnswer) {
    const translatedPhrase = translatedPhrases.find(p => p.id === phrase.id);
    const index = translatedPhrase.answers.indexOf(translatedAnswer);
    return phrase.answers[index]; // Deutsche Antwort zurückgeben
}

// Zeige die nächste Phrase
function showPhrase(index) {
    if (index >= currentQuery.phraseIds.length) {
        showSummary();
        return;
    }
    const phraseId = currentQuery.phraseIds[index];
    const phrase = phrases.find(p => p.id === phraseId);
    const translated = translatedPhrases.find(p => p.id === phraseId);
    const popup = document.getElementById('query-popup');
    const title = document.getElementById('popup-title');
    const icon = document.getElementById('popup-icon');
    const content = document.getElementById('popup-content');
    icon.className = `${currentQuery.icon} text-3xl text-gray-700 mr-2`;
    title.querySelector('span').textContent = currentQuery.title;
    content.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <p class="text-4xl font-extrabold text-blue-700">${translated.phrase}</p>
            <button class="play-btn bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600"><i class="fas fa-play"></i></button>
        </div>
        <p class="text-sm text-gray-400 mb-4">${phrase.phrase}</p>
        <div class="space-y-2">
            ${translated.answers.map(answer => `
                <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg cursor-pointer answer-option">
                    <p class="text-lg font-semibold text-gray-700">${answer}</p>
                    <button class="play-answer bg-green-500 text-white p-2 rounded-full hover:bg-green-600"><i class="fas fa-play"></i></button>
                </div>
            `).join('')}
        </div>
    `;
    popup.classList.remove('hidden');

    // Event-Listener für Antworten nur im Smart Query-Modus
    const smartQueryActive = !document.getElementById('smart-query').classList.contains('hidden');
    const answerElements = document.querySelectorAll('.answer-option');
    answerElements.forEach(answerElement => {
        // Entferne alte Listener, um Duplikate zu vermeiden
        answerElement.removeEventListener('click', handleAnswerClick);
        if (smartQueryActive) {
            answerElement.addEventListener('click', handleAnswerClick);
        }
    });
}

// Event-Handler für Antwort-Klicks
function handleAnswerClick(event) {
    const answerElement = event.currentTarget;
    const answerText = answerElement.querySelector('p').textContent;
    const phraseId = currentQuery.phraseIds[currentPhraseIndex];
    const phrase = phrases.find(p => p.id === phraseId);

    // Visuelles Feedback
    answerElement.classList.add('bg-green-100');
    setTimeout(() => answerElement.classList.remove('bg-green-100'), 300);

    // Speichere die deutsche Antwort
    const germanAnswer = getGermanAnswer(phrase, answerText);
    answers.push({ question: phrase.phrase, answer: germanAnswer });
    currentPhraseIndex++;
    showPhrase(currentPhraseIndex);
}

// Zeige die Zusammenfassung
function showSummary() {
    const popupContent = document.getElementById('popup-content');
    const summaryContent = document.getElementById('summary-content');
    const summaryList = document.getElementById('summary-list');
    popupContent.classList.add('hidden');
    summaryContent.classList.remove('hidden');
    summaryList.innerHTML = answers.map(a => `
        <div class="bg-blue-100 p-4 rounded-lg shadow-md">
            <p class="font-semibold text-blue-700">${a.question}</p>
            <p class="text-gray-700">${a.answer}</p>
        </div>
    `).join('');
    document.getElementById('finish-btn').addEventListener('click', () => {
        document.getElementById('query-popup').classList.add('hidden');
    });
}

// Schließe das Popup
document.getElementById('close-popup-smart').addEventListener('click', () => {
    document.getElementById('query-popup').classList.add('hidden');
});

// Initialisiere Smart Query beim Wechsel in den Modus
function initSmartQuery() {
    loadAutoQueries();
}

// Rufe initSmartQuery auf, wenn der Smart Query-Modus aktiviert wird
document.getElementById('smart-query-btn').addEventListener('click', () => {
    switchMode('smart-query');
    initSmartQuery();
});

// Simulierter russischer Text (hartcodiert)
const simulatedRussianText = `
Мы сообщаем о стационарном лечении пациента, упомянутого выше в нашей клинике.

Диагнозы
Helicobacter-Pylori-позитивная язва в двенадцатиперстном дуэли Bulbus
Гастрит тип б
Выходной стеноз желудка через воспалительный отек слизистой оболочки
Рефлюксофагит Град D (произносится, круговой эзофагит)
ICD-10: K26.3; K21.0; K29.5; K29.8

Процедура
Терапия искоренения в соответствии с французской схемой (см. План лекарств).
Амбулаторная гастроскопия на -.–.

Анамнез
Независимая презентация пациента в отделении неотложной помощи с болью в животе, которая существовала более недели. В течение примерно двух дней рвота также добавлялась несколько раз в день, до семи раз в день. Иногда он вызывает рвоту, потому что у него сильное давление в верхней части живота после потребления пищи. Сегодня вечером он принял 400 мг против боли, что дало ему улучшение.

Последние движения кишечника четыре дня назад, но обычно каждый день. Хобберн несколько раз в неделю в течение нескольких недель, что очень мучает его. Никогда не получал гастроскопию или колоноскопию. Нет лихорадки, нет кашля, нет боли во время движений кишечника или мочеиспускания, нет диареи.

Аллергия: не известно. Домашние лекарства: нет обычных лекарств. Он работает на местах и ​​в настоящее время профессионально в большом городе. Живи один, нет детей.

Физическое обследование
36-летний пациент с острым уменьшенным общим и тонким статусом питания (185 см, 72,2 кг, ИМТ 21,1 кг/м²). Бодрствование, адекватное, полностью ориентированное; выглядит взволнованным и напряженным. RR 110/68 мм рт.

Герц тонит и ритмично, тахикард. Легкие вентилируются, везикулярный дыхательный шум, без фонового шума. Живот: настоящие кишечные шумы над всеми квадрантами, брюшное одеяло мягкое, эпигастральное больно, без напряжения защиты. Склады почек и позвоночник не стучат. Нет отека.
`;

// Event-Listener für den Übersetzungsbutton
document.getElementById('translate-btn').addEventListener('click', () => {
    const translatedDocument = document.getElementById('translated-document');
    const documentContent = document.getElementById('document-content');
    documentContent.textContent = simulatedRussianText; // Setze den simulierten Text
    translatedDocument.classList.remove('hidden'); // Zeige das Dokument an
});

// Event-Listener für den Druckbutton
document.getElementById('print-btn').addEventListener('click', () => {
    const printContent = document.getElementById('translated-document').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
});

// Fake: 
// Mikrofon-Funktionalität für Patienten
document.getElementById('patient-mic-btn').addEventListener('click', () => {
    const micButton = document.getElementById('patient-mic-btn');
    micButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; // Lade-Icon
    setTimeout(() => {
        document.getElementById('patient-input').value = 'У меня болит живот. Они начались вчера.';
        micButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Zurück zum Mikrofon-Icon
    }, 1000); // Simulierte Verzögerung von 1 Sekunde
});

// Übersetzungsfunktion für Patienten (Prototyp)
function translatePatient() {
    const patientText = document.getElementById('patient-input').value;
    const patientLanguage = document.getElementById('patient-language').value;

    // Übersetzung ins Arztfenster
    if (patientLanguage === 'ru' && patientText === 'У меня болит живот. Они начались вчера.') {
        document.getElementById('doctor-input').value = 'Ich habe Schmerzen in meinem Bauch. Sie haben gestern angefangen.';
    } else {
        document.getElementById('doctor-input').value = 'Ich habe Schmerzen in meinem Bauch. Die Schmerzen haben gestern angefangen.';
    }

    // Meta-Informationen anzeigen
    const metaContent = document.getElementById('meta-content');
    const randomMeta = Math.random() > 0.5 ? 'Patient gebraucht Superlative' : 'Patient gebraucht wenig Steigerungen';
    metaContent.innerHTML = `<p class="text-gray-700">${randomMeta}</p>`;
    document.getElementById("text-content").style.display = "inline";

    // Illustrationen anzeigen
    const illustrationContent = document.getElementById('illustration-content');
    illustrationContent.innerHTML = `
        <div class="bg-white p-3 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition duration-200" onclick="showIllustration()">
            Abdomen
        </div>
    `;

    // Erwähnte Struktur anzeigen
    const structureContent = document.getElementById('structure-content');
    structureContent.innerHTML = `
        <div class="flex items-center space-x-4">
            <div class="bg-white p-3 rounded-lg shadow-md text-gray-700">Zeitpunkt: Gestern</div>
            <div class="border-t border-gray-300 flex-1"></div>
            <div class="bg-white p-3 rounded-lg shadow-md text-gray-700">Symptome: Bauchschmerzen</div>
        </div>
    `;
}

// Sprachhinweis für Russisch
document.getElementById('patient-language').addEventListener('change', (event) => {
    const languageHint = document.getElementById('language-hint');
    if (event.target.value === 'ru') {
        languageHint.classList.remove('hidden');
    } else {
        languageHint.classList.add('hidden');
    }
});

// Illustration anzeigen (Modal-Simulation)
function showIllustration() {
    // Simuliertes Modal (kann durch ein echtes Modal ersetzt werden)
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg relative">
            <button class="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onclick="this.parentElement.parentElement.remove()">✕</button>
            <img src="abdomen.jpeg" alt="Abdomen" class="max-w-full h-auto">
        </div>
    `;
    document.body.appendChild(modal);
}

// Platzhalterfunktionen (falls noch nicht definiert)
function translate(source) {
    console.log(`Übersetzen von ${source} wird ausgeführt`);
}

function playText(inputId) {
    console.log(`Text von ${inputId} wird abgespielt`);
}

function newConversation() {
    console.log('Neues Gespräch gestartet');
}

function selectGender(gender) {
    console.log(`Geschlecht ausgewählt: ${gender}`);
}