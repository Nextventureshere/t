// Funktion zum Wechseln der Kategorien
function switchMode(mode) {
    const modes = ['live-translation', 'translations', 'smart-query'];
    modes.forEach(m => {
        const element = document.getElementById(m);
        const button = document.getElementById(`${m}-btn`);
        if (m === mode) {
            element.classList.remove('hidden');
            button.classList.add('active');
        } else {
            element.classList.add('hidden');
            button.classList.remove('active');
        }
    });

    // Zusätzliche Initialisierung je nach Modus
    if (mode === 'translations') loadPhrases();
    if (mode === 'smart-query') loadQueries();
}

// Standardmäßig Live-Übersetzung anzeigen
switchMode('live-translation');

// **Live-Übersetzung**
document.getElementById('doctor-translate-btn').addEventListener('click', () => {
    const text = document.getElementById('doctor-input').value;
    const fromLang = document.getElementById('doctor-language').value;
    const toLang = document.getElementById('patient-language').value;
    // Hier würde die Übersetzungslogik stehen (z. B. API-Aufruf)
    console.log(`Übersetze Arzt-Dialog von ${fromLang} nach ${toLang}: ${text}`);
    // Beispiel: Ausgabe ins Patientenfeld
    document.getElementById('patient-input').value = `Übersetzt: ${text}`;
});

document.getElementById('patient-translate-btn').addEventListener('click', () => {
    const text = document.getElementById('patient-input').value;
    const fromLang = document.getElementById('patient-language').value;
    const toLang = document.getElementById('doctor-language').value;
    // Hier würde die Übersetzungslogik stehen
    console.log(`Übersetze Patient-Dialog von ${fromLang} nach ${toLang}: ${text}`);
    // Beispiel: Ausgabe ins Arztfeld
    document.getElementById('doctor-input').value = `Übersetzt: ${text}`;
});

// Mikrofon- und Play-Buttons (Platzhalter)
document.getElementById('doctor-mic-btn').addEventListener('click', () => console.log('Mikrofon Arzt aktiviert'));
document.getElementById('patient-mic-btn').addEventListener('click', () => console.log('Mikrofon Patient aktiviert'));
document.getElementById('doctor-play-btn').addEventListener('click', () => console.log('Audio Arzt abspielen'));
document.getElementById('patient-play-btn').addEventListener('click', () => console.log('Audio Patient abspielen'));

// **Übersetzungen**
const phrases = [
    { id: 1, phrase: 'Hallo', translation: 'Hello' },
    { id: 2, phrase: 'Wie geht es Ihnen?', translation: 'How are you?' },
    // Ersetze dies durch Daten aus deiner JSON-Datei
];

function loadPhrases() {
    const phraseList = document.getElementById('phrase-list');
    phraseList.innerHTML = phrases.map(p => `
        <div class="bg-white p-3 rounded-xl shadow-md">
            <p class="font-medium text-gray-800">${p.phrase}</p>
            <p class="text-gray-600 text-sm">${p.translation}</p>
        </div>
    `).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPhrases = phrases.filter(p => p.phrase.toLowerCase().includes(searchTerm));
    const phraseList = document.getElementById('phrase-list');
    phraseList.innerHTML = filteredPhrases.map(p => `
        <div class="bg-white p-3 rounded-xl shadow-md">
            <p class="font-medium text-gray-800">${p.phrase}</p>
            <p class="text-gray-600 text-sm">${p.translation}</p>
        </div>
    `).join('');
});

// **Intelligente Abfrage**
const queries = [
    { id: 1, title: 'Schmerzabfrage', icon: 'fas fa-brain' },
    { id: 2, title: 'Symptomliste', icon: 'fas fa-list' },
    // Ersetze dies durch Daten aus deiner JSON-Datei
];

function loadQueries() {
    const queryList = document.getElementById('query-list');
    queryList.innerHTML = queries.map(q => `
        <button class="w-full bg-white p-3 rounded-xl shadow-md flex items-center space-x-3 hover:bg-gray-50 transition" onclick="startQuery(${q.id})">
            <i class="${q.icon} text-xl text-gray-700"></i>
            <span class="text-gray-800">${q.title}</span>
        </button>
    `).join('');
}

function startQuery(id) {
    const query = queries.find(q => q.id === id);
    if (!query) return;

    document.getElementById('popup-title').textContent = query.title;
    document.getElementById('popup-content').innerHTML = `<p>Interaktion für ${query.title} wird geladen...</p>`;
    // Hier würde die Abfragelogik stehen
    document.getElementById('query-popup').classList.remove('hidden');

    // Beispiel-Zusammenfassung
    setTimeout(() => {
        document.getElementById('popup-content').classList.add('hidden');
        document.getElementById('summary-content').classList.remove('hidden');
        document.getElementById('summary-list').innerHTML = `
            <p>Patient: Bauchschmerzen seit gestern.</p>
        `;
    }, 2000); // Simuliert eine Abfrage
}

// Popup schließen
document.getElementById('close-popup-smart').addEventListener('click', () => {
    document.getElementById('query-popup').classList.add('hidden');
    document.getElementById('popup-content').classList.remove('hidden');
    document.getElementById('summary-content').classList.add('hidden');
});

document.getElementById('finish-btn').addEventListener('click', () => {
    document.getElementById('query-popup').classList.add('hidden');
    console.log('Abfrage abgeschlossen');
});