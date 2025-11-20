// Variabel global dan data awal
let currentRole = '';
let books = JSON.parse(localStorage.getItem('books')) || [
    { title: 'Novel: Harry Potter', available: true },
    { title: 'Cerpen: Kisah Klasik', available: false },
    { title: 'Latsol Matematika', available: true }
];
let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [
    {
        title: 'Quiz Matematika Dasar',
        questions: [
            { question: 'Berapa 2 + 2?', options: ['3', '4', '5'], correct: 1 },
            { question: 'Apa akar kuadrat dari 9?', options: ['2', '3', '4'], correct: 1 }
        ]
    }
];

let fasilitasList = [
    "LabKom 1", "LabKom 2", "LabKom 3", "LabKom 4",
    "Lab Kimia", "Lab Biologi", "Lab Fisika", "PKWU",
    "Perpustakaan", "Mushola", "Lapangan Basket", "Lapangan Voli",
    "Aula 1", "Aula 2"
];

// Jadwal fasilitas: { fasilitas, tanggal, jam, status, guru, mapel, kelas }
let jadwalFasilitas = JSON.parse(localStorage.getItem('jadwalFasilitas')) || [];

// Fungsi set role dan render konten
function setRole(role) {
    currentRole = role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    loadContent();
}

// Fungsi kembali ke halaman awal
function goHome() {
    currentRole = '';
    document.getElementById('content').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    document.getElementById('content').innerHTML = '';
}

// Render konten berdasar peran
function loadContent() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (currentRole === 'siswa') {
        content.innerHTML = `
            <h2><i class="fas fa-search"></i> Menu Siswa</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <h3>Cari Buku</h3>
            <input type="text" id="searchBook" placeholder="Ketik judul buku" />
            <button onclick="searchBook()">Cari</button>
            <div id="bookResults"></div>
            <h3>Kerjakan Quiz</h3>
            <select id="quizSelect"></select>
            <button onclick="startQuiz()">Mulai Quiz</button>
            <div id="quizContainer"></div>
        `;
        loadQuizzesForStudent();
    } else if (currentRole === 'guru') {
        content.innerHTML = `
            <h2><i class="fas fa-edit"></i> Menu Guru</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <h3>Buat Bank Soal</h3>
            <form id="quizForm">
                <input type="text" id="quizTitle" placeholder="Judul Quiz" required />
                <div id="questionsContainer"></div>
                <button type="button" onclick="addQuestion()">Tambah Soal</button>
                <button type="submit">Simpan Quiz</button>
            </form>
        `;
        document.getElementById('quizForm').addEventListener('submit', saveQuiz);
    } else if (currentRole === 'penjaga') {
        content.innerHTML = `
            <h2><i class="fas fa-cogs"></i> Menu Penjaga Perpustakaan</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <h3>Kelola Buku</h3>
            <form id="bookForm">
                <input type="text" id="bookTitle" placeholder="Judul Buku" required />
                <button type="submit">Tambah Buku</button>
            </form>
            <ul id="bookList"></ul>
        `;
        document.getElementById('bookForm').addEventListener('submit', addBook);
        displayBooks();
    } else if (currentRole === 'fasilitas') {
        content.innerHTML = `
            <h2><i class="fas fa-building"></i> Menu Fasilitas</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <label for="selectFasilitas">Pilih Fasilitas:</label>
            <select id="selectFasilitas"></select>
            <div id="jadwalContainer"></div>
        `;
        loadFasilitasOptions();
        document.getElementById('selectFasilitas').addEventListener('change', function() {
            renderJadwalFasilitasTanggal(this.value, new Date().toISOString().slice(0,10));
        });
    }
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
}

// Fasilitas options
function loadFasilitasOptions() {
    const select = document.getElementById('selectFasilitas');
    select.innerHTML = '<option value="">--Pilih Fasilitas--</option>' + fasilitasList.map(f => `<option value="${f}">${f}</option>`).join('');
}

// Fungsi dapatkan jam ke berapa sekarang
function getJamSekarang() {
    const now = new Date();
    const jamSekolahMulai = 7; // jam masuk sekolah 7 pagi
    const currentHour = now.getHours();
    const jamKe = currentHour - jamSekolahMulai + 1;
    if(jamKe < 1) return 0;
    if(jamKe > 10) return 11;
    return jamKe;
}

// Render jadwal fasilitas berdasarkan tanggal (default hari ini)
function renderJadwalFasilitasTanggal(fasil, tanggal) {
    const container = document.getElementById('jadwalContainer');

    if (!fasil) {
        container.innerHTML = '';
        return;
    }

    let jadwalPerTanggal = jadwalFasilitas.filter(j => j.fasilitas === fasil && j.tanggal === tanggal);
    const jamSekarang = getJamSekarang();

    let html = `<h3>Jadwal untuk ${fasil} pada tanggal <input type="date" id="tanggalJadwal" value="${tanggal}"/></h3>`;
    html += `<table border="1" cellpadding="8" cellspacing="0" style="width:100%; max-width:600px;">
    <thead>
        <tr>
            <th>Jam Ke-</th>
            <th>Status</th>
            <th>Aksi</th>
        </tr>
    </thead>
    <tbody>`;
    for(let jam=1; jam<=10; jam++) {
        const slot = jadwalPerTanggal.find(j => j.jam === jam);
        let statusText='Kosong';
        let aksiButton = `<button onclick="openBookingForm('${fasil}',${jam})">Booking</button>`;

        if(slot){
            if(jamSekarang >= jam) {
                statusText = `Digunakan oleh ${slot.guru}, ${slot.mapel}, Kelas ${slot.kelas}`;
            } else {
                statusText = `Booking oleh ${slot.guru}, ${slot.mapel}, Kelas ${slot.kelas}`;
            }
            aksiButton = `<button onclick="openBookingForm('${fasil}',${jam})">Edit Booking</button> <button onclick="hapusBooking('${fasil}',${jam})" style="background:#dc3545;margin-left:10px;">Batalkan</button>`;
        }

        html += `<tr>
            <td>${jam}</td>
            <td>${statusText}</td>
            <td>${aksiButton}</td>
        </tr>`;
    }
    html += `</tbody></table>`;
    html += `<div id="bookingFormContainer"></div>`;

    container.innerHTML = html;

    document.getElementById('tanggalJadwal').addEventListener('change', function(e) {
        renderJadwalFasilitasTanggal(fasil, e.target.value);
    });
}

// Buka form booking atau edit booking
function openBookingForm(fasilitas, jam) {
    const container = document.getElementById('bookingFormContainer');
    const tanggalInput = document.getElementById('tanggalJadwal');
    const tanggal = tanggalInput ? tanggalInput.value : new Date().toISOString().slice(0,10);

    let existing = jadwalFasilitas.find(j => j.fasilitas === fasilitas && j.jam === jam && j.tanggal === tanggal);

    container.innerHTML = `
    <h4>Booking untuk ${fasilitas} Jam ke-${jam} tanggal ${tanggal}</h4>
    <form id="formBookingFasilitas">
        <label>Nama Guru Pengajar</label>
        <input type="text" id="inputGuru" value="${existing ? existing.guru : ''}" required />
        <label>Mata Pelajaran</label>
        <input type="text" id="inputMapel" value="${existing ? existing.mapel : ''}" required />
        <label>Kelas</label>
        <input type="text" id="inputKelas" value="${existing ? existing.kelas : ''}" required />
        <button type="submit">${existing ? 'Perbarui Booking' : 'Buat Booking'}</button>
        <button type="button" onclick="batalBookingForm()">Batal</button>
    </form>
    <p style="color:#666;font-size:0.9em;">Jika selesai, klik "Buat Booking" atau "Perbarui Booking".</p>
    `;

    document.getElementById('formBookingFasilitas').addEventListener('submit', function(e){
        e.preventDefault();
        const guru = document.getElementById('inputGuru').value.trim();
        const mapel = document.getElementById('inputMapel').value.trim();
        const kelas = document.getElementById('inputKelas').value.trim();
        if(!guru || !mapel || !kelas){
            alert('Semua data harus diisi!');
            return;
        }

        let idx = jadwalFasilitas.findIndex(j=>j.fasilitas===fasilitas && j.jam===jam && j.tanggal===tanggal);
        if(idx !== -1){
            jadwalFasilitas[idx].status = 'booking';
            jadwalFasilitas[idx].guru = guru;
            jadwalFasilitas[idx].mapel = mapel;
            jadwalFasilitas[idx].kelas = kelas;
        }else{
            jadwalFasilitas.push({
                fasilitas,
                tanggal,
                jam,
                status: 'booking',
                guru,
                mapel,
                kelas
            });
        }

        localStorage.setItem('jadwalFasilitas', JSON.stringify(jadwalFasilitas));
        alert('Booking berhasil disimpan!');
        batalBookingForm();
        renderJadwalFasilitasTanggal(fasilitas, tanggal);
    });
}

function batalBookingForm(){
    document.getElementById('bookingFormContainer').innerHTML = '';
}

function hapusBooking(fasilitas, jam){
    const tanggalInput = document.getElementById('tanggalJadwal');
    const tanggal = tanggalInput ? tanggalInput.value : new Date().toISOString().slice(0,10);

    if(!confirm(`Batalkan booking ${fasilitas} jam ke-${jam} tanggal ${tanggal}?`)) return;

    let idx = jadwalFasilitas.findIndex(j=>j.fasilitas===fasilitas && j.jam===jam && j.tanggal===tanggal);
    if(idx !== -1){
        jadwalFasilitas.splice(idx,1);
        localStorage.setItem('jadwalFasilitas', JSON.stringify(jadwalFasilitas));
        alert('Booking berhasil dibatalkan.');
        renderJadwalFasilitasTanggal(fasilitas,tanggal);
        batalBookingForm();
    }
}

// --- Fungsi-fungsi fitur quiz (tanpa radio) ---

window.selectedOptions = {};

function loadQuizzesForStudent() {
    const select = document.getElementById('quizSelect');
    select.innerHTML = '<option>Pilih Quiz</option>' + quizzes.map((quiz, index) => `<option value="${index}">${quiz.title}</option>`).join('');
}

function startQuiz() {
    const index = document.getElementById('quizSelect').value;
    if (index === 'Pilih Quiz') return alert('Pilih quiz dulu!');
    const quiz = quizzes[index];
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    window.selectedOptions = {};
    quiz.questions.forEach((q,i) => {
        container.innerHTML += `
        <div class="question">
            <p><strong>${q.question}</strong></p>
            <div class="options" id="options-q${i}">
                ${q.options.map((opt,j) => `<div class="option" onclick="selectOption(${i},${j})">${opt}</div>`).join('')}
            </div>
        </div>
        `;
    });
    container.innerHTML += `<button onclick="submitQuiz(${index})">Submit</button>`;
}

function selectOption(soalIndex, optionIndex) {
    window.selectedOptions[soalIndex] = optionIndex;
    const optionsDiv = document.querySelector(`#options-q${soalIndex}`);
    optionsDiv.querySelectorAll('.option').forEach(optDiv => {
        optDiv.style.background = '';
        optDiv.style.color = '#253858';
        optDiv.style.fontWeight = '600';
    });
    const opsiTerpilih = optionsDiv.children[optionIndex];
    if(opsiTerpilih){
        opsiTerpilih.style.background = '#f8b500';
        opsiTerpilih.style.color = 'white';
        opsiTerpilih.style.fontWeight = '700';
    }
}

function submitQuiz(index) {
    const quiz = quizzes[index];
    let score = 0;
    for(let i=0; i<quiz.questions.length; i++){
        if(window.selectedOptions[i] !== undefined && window.selectedOptions[i] === quiz.questions[i].correct) score++;
    }
    document.getElementById('quizContainer').innerHTML += `<div class="quiz-result">Nilai Anda: ${score}/${quiz.questions.length}</div>`;
}

// --- Fungsi lain fitur buku, guru, penjaga tetap sama ---

// Tambah Buku Penjaga
function addBook(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    if(!title){
        alert('Judul buku tidak boleh kosong!');
        return;
    }
    books.push({ title, available:true });
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
    document.getElementById('bookForm').reset();
}

function displayBooks() {
    const list = document.getElementById('bookList');
    list.innerHTML = books.map((book,idx) => `
        <li>
            ${book.title} - ${book.available ? '<span style="color:green">Tersedia</span>' : '<span style="color:red">Dipinjam</span>'}
            <button onclick="toggleBorrow(${idx})">${book.available ? 'Tandai Dipinjam' : 'Tandai Kembali'}</button>
            <button onclick="deleteBook(${idx})" style="background:#dc3545;margin-left:10px;">Hapus</button>
        </li>
    `).join('');
}

function toggleBorrow(index) {
    books[index].available = !books[index].available;
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}

function deleteBook(index) {
    books.splice(index,1);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}

// Fungsi cari buku siswa
function searchBook(){
    const query = document.getElementById('searchBook').value.toLowerCase();
    const results = books.filter(b=>b.title.toLowerCase().includes(query));
    const resultsDiv = document.getElementById('bookResults');
    if(results.length){
        resultsDiv.innerHTML = results.map(book => `<li>${book.title} - Status: ${book.available ? '<span style="color:green">Tersedia</span>' : '<span style="color:red">Dipinjam</span>'}</li>`).join('');
    }else{
        resultsDiv.innerHTML = '<p>Tidak ada buku ditemukan.</p>';
    }
}

// Tambah soal guru
function addQuestion(){
    const container = document.getElementById('questionsContainer');
    const questionIndex = container.children.length;
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <h4>Soal ${questionIndex + 1}</h4>
        <input type="text" placeholder="Pertanyaan" required />
        <div class="options">
            <input type="text" placeholder="Opsi 1" required />
            <input type="text" placeholder="Opsi 2" required />
            <input type="text" placeholder="Opsi 3 (opsional)" />
            <input type="text" placeholder="Opsi 4 (opsional)" />
        </div>
        <select required>
            <option value="">Pilih Jawaban Benar</option>
            <option value="0">Opsi 1</option>
            <option value="1">Opsi 2</option>
            <option value="2">Opsi 3</option>
            <option value="3">Opsi 4</option>
        </select>
        <button type="button" onclick="removeQuestion(this)">Hapus Soal Ini</button>
    `;
    container.appendChild(questionDiv);
}

function removeQuestion(button){
    button.parentElement.remove();
}

function saveQuiz(e){
    e.preventDefault();
    const title = document.getElementById('quizTitle').value.trim();
    const questions = [];
    const questionDivs = document.querySelectorAll('.question');

    for(let div of questionDivs){
        const question = div.querySelector('input[placeholder="Pertanyaan"]').value.trim();
        const options = Array.from(div.querySelectorAll('.options input')).map(i=>i.value.trim()).filter(o=>o !== '');
        const correct = parseInt(div.querySelector('select').value);

        if(!question || options.length < 2 || isNaN(correct) || correct >= options.length){
            alert('Soal tidak lengkap! Pastikan pertanyaan, minimal 2 opsi, dan jawaban benar sesuai opsi.');
            return;
        }
        questions.push({question, options, correct});
    }

    if(!title){
        alert('Judul quiz tidak boleh kosong!');
        return;
    }
    if(questions.length === 0){
        alert('Tambahkan setidaknya satu soal!');
        return;
    }

    quizzes.push({title, questions});
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    alert('Quiz disimpan!');
    document.getElementById('quizForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
}
