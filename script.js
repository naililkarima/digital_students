// Data global dengan properti kategori, resi, tanggal pengembalian, dan info peminjam
let currentRole = '';
let books = JSON.parse(localStorage.getItem('books')) || [
    { title: 'Novel: Harry Potter', available: true, resi: null, tanggalPengembalian: null, kategori: 'Novel', namaPeminjam: null, absenPeminjam: null, kelasPeminjam: null },
    { title: 'Matematika Kelas X', available: true, resi: null, tanggalPengembalian: null, kategori: 'Pelajaran Kelas X', namaPeminjam: null, absenPeminjam: null, kelasPeminjam: null },
    { title: 'Fisika Kelas XI', available: true, resi: null, tanggalPengembalian: null, kategori: 'Pelajaran Kelas XI', namaPeminjam: null, absenPeminjam: null, kelasPeminjam: null },
    { title: 'Kimia Kelas XII', available: false, resi: 'RESI20231120-001', tanggalPengembalian: '2023-12-01', kategori: 'Pelajaran Kelas XII', namaPeminjam: 'Ahmad', absenPeminjam: '15', kelasPeminjam: 'XII IPA 1' },
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

// Set role dan render
function setRole(role) {
    currentRole = role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    loadContent();
}

// Kembali ke halaman awal
function goHome() {
    currentRole = '';
    document.getElementById('content').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    document.getElementById('content').innerHTML = '';
}

// Render konten setiap role
function loadContent() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if(currentRole === 'siswa'){
        content.innerHTML = `
            <h2><i class="fas fa-search"></i> Menu Siswa</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <h3>Filter Kategori Buku</h3>
            <select id="filterKategori" onchange="searchBook()">
                <option value="Semua">Semua Kategori</option>
                <option value="Novel">Novel</option>
                <option value="Pelajaran Kelas X">Pelajaran Kelas X</option>
                <option value="Pelajaran Kelas XI">Pelajaran Kelas XI</option>
                <option value="Pelajaran Kelas XII">Pelajaran Kelas XII</option>
            </select>
            <h3>Cari Buku</h3>
            <input type="text" id="searchBook" placeholder="Ketik judul buku" oninput="searchBook()" />
            <div id="bookResults"></div>
            <h3>Kerjakan Quiz</h3>
            <select id="quizSelect"></select>
            <button onclick="startQuiz()">Mulai Quiz</button>
            <div id="quizContainer"></div>
        `;
        loadQuizzesForStudent();
    }
    else if(currentRole === 'guru'){
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
    }
    else if(currentRole === 'penjaga'){
        content.innerHTML = `
            <h2><i class="fas fa-cogs"></i> Menu Penjaga Perpustakaan</h2>
            <button class="logout-btn" onclick="goHome()">Keluar</button>
            <h3>Tambah Buku Baru</h3>
            <form id="bookForm">
                <input type="text" id="bookTitle" placeholder="Judul Buku" required />
                <input type="text" id="bookResi" placeholder="Nomor Resi Buku (isi manual)" required />
                <select id="bookKategori" required>
                    <option value="">Pilih Kategori</option>
                    <option value="Novel">Novel</option>
                    <option value="Pelajaran Kelas X">Pelajaran Kelas X</option>
                    <option value="Pelajaran Kelas XI">Pelajaran Kelas XI</option>
                    <option value="Pelajaran Kelas XII">Pelajaran Kelas XII</option>
                </select>
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

// Fungsi cari buku dengan filter kategori (siswa)
function searchBook(){
    const query = document.getElementById('searchBook').value.toLowerCase();
    const kategori = document.getElementById('filterKategori').value;
    const results = books.filter(b => 
        (kategori === 'Semua' || b.kategori === kategori) &&
        b.title.toLowerCase().includes(query)
    );
    const resultsDiv = document.getElementById('bookResults');
    if(results.length){
        resultsDiv.innerHTML = results.map(book => `
            <li>
                <strong>${book.title}</strong> (${book.kategori}) - 
                Status: ${book.available ? '<span style="color:green">Tersedia</span>' : '<span style="color:red">Dipinjam</span>'}
            </li>
        `).join('');
    } else {
        resultsDiv.innerHTML = '<p>Tidak ada buku ditemukan.</p>';
    }
}

// Quiz tanpa radio button klik
window.selectedOptions = {};

function loadQuizzesForStudent() {
    const select = document.getElementById('quizSelect');
    select.innerHTML = '<option>Pilih Quiz</option>' + quizzes.map((quiz, index) => `<option value="${index}">${quiz.title}</option>`).join('');
}

function startQuiz() {
    const index
