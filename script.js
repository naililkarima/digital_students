// Data global dan data awal
let currentRole = '';
let books = JSON.parse(localStorage.getItem('books')) || [
    { title: 'Novel: Harry Potter', available: true, resi: null, tanggalPengembalian: null },
    { title: 'Cerpen: Kisah Klasik', available: false, resi: 'RESI20231120-001', tanggalPengembalian: '2023-12-01' },
    { title: 'Latsol Matematika', available: true, resi: null, tanggalPengembalian: null }
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

// Fungsi set peran & render konten
function setRole(role) {
    currentRole = role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    loadContent();
}

// Fungsi kembali ke halaman utama
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

    if(currentRole === 'siswa'){
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
    }else if(currentRole === 'guru'){
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
    }else if(currentRole === 'penjaga'){
        content.innerHTML = `
            <h2><i class="fas fa-cogs"></i> Menu Penjaga Perpustakaan</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <h3>Kelola Buku</h3>
            <form id="bookForm">
                <input type="text" id="bookTitle" placeholder="Judul Buku" required />
                <button type="submit">Tambah Buku</button>
            </form>
            <h3>Daftar Buku</h3>
            <ul id="bookList"></ul>
        `;
        document.getElementById('bookForm').addEventListener('submit', addBook);
        displayBooks();
    }
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
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

// Quiz tanpa radio button, klik div opsi langsung
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

// Tambah buku penjaga
function addBook(e){
    e.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    if(!title){
        alert('Judul buku tidak boleh kosong!');
        return;
    }
    books.push({title, available:true, resi:null, tanggalPengembalian:null});
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
    document.getElementById('bookForm').reset();
}

// Generate nomor resi unik untuk peminjaman
function generateResi() {
    const datePart = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const resiHariIni = books.map(b => b.resi).filter(r => r && r.startsWith('RESI'+datePart)).sort();
    let nomor = 1;
    if(resiHariIni.length > 0) {
        const last = resiHariIni[resiHariIni.length-1];
        nomor = parseInt(last.slice(-3)) + 1;
    }
    return `RESI${datePart}-${nomor.toString().padStart(3,'0')}`;
}

// Tampilkan daftar buku dengan resi dan tanggal pengembalian
function displayBooks(){
    const list = document.getElementById('bookList');
    if(books.length === 0) {
        list.innerHTML = '<p>Belum ada buku tersedia.</p>';
        return;
    }
    list.innerHTML = books.map((book, idx) => `
        <li>
            <strong>${book.title}</strong> - 
            ${book.available 
                ? `<span style="color:green">Tersedia</span>` 
                : `<span style="color:red">Dipinjam</span><br>
                   <small>Nomor Resi: <em>${book.resi || '-'}</em></small><br>
                   <small>Tanggal Pengembalian: <em>${book.tanggalPengembalian || '-'}</em></small>`
            }
            <br/>
            ${book.available 
                ? `<button onclick="pinjamBuku(${idx})" style="background:#28a745;color:#fff;">Pinjam Buku</button>` 
                : `<button onclick="kembalikanBuku(${idx})" style="background:#ffc107;">Kembalikan Buku</button>`
            }
            <button onclick="deleteBook(${idx})" style="background:#dc3545;margin-left:10px;color:#fff;">Hapus</button>
        </li>
    `).join('');
}

function pinjamBuku(index) {
    const buku = books[index];
    const tanggalKembali = prompt('Masukkan tanggal pengembalian (YYYY-MM-DD)', '');

    if(!tanggalKembali) {
        alert('Tanggal pengembalian wajib diisi!');
        return;
    }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(tanggalKembali)) {
        alert('Format tanggal tidak valid. Contoh: 2023-12-31');
        return;
    }

    buku.available = false;
    buku.tanggalPengembalian = tanggalKembali;
    buku.resi = generateResi();
    localStorage.setItem('books', JSON.stringify(books));
    alert(`Buku "${buku.title}" berhasil dipinjam.\nNomor Resi: ${buku.resi}\nTanggal Pengembalian: ${buku.tanggalPengembalian}`);
    displayBooks();
}

function kembalikanBuku(index) {
    if(!confirm('Apakah buku sudah dikembalikan?')) return;
    const buku = books[index];
    buku.available = true;
    buku.tanggalPengembalian = null;
    buku.resi = null;
    localStorage.setItem('books', JSON.stringify(books));
    alert(`Buku "${buku.title}" sudah dikembalikan dan tersedia.`);
    displayBooks();
}

function toggleBorrow(index) {
    books[index].available = !books[index].available;
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}

function deleteBook(index){
    if(!confirm('Yakin ingin menghapus buku ini?')) return;
    books.splice(index,1);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}
