// Variabel global
let currentRole = '';
let books = JSON.parse(localStorage.getItem('books')) || [
    { title: 'Novel: Harry Potter', available: true },
    { title: 'Cerpen: Kisah Klasik', available: false },
    { title: 'Latsol Matematika', available: true }
]; // Data dummy
let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [
    {
        title: 'Quiz Matematika Dasar',
        questions: [
            { question: 'Berapa 2 + 2?', options: ['3', '4', '5'], correct: 1 },
            { question: 'Apa akar kuadrat dari 9?', options: ['2', '3', '4'], correct: 1 }
        ]
    }
]; // Data dummy

// Fungsi untuk set peran
function setRole(role) {
    currentRole = role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    loadContent();
}

// Fungsi untuk load konten berdasarkan peran
function loadContent() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (currentRole === 'siswa') {
        content.innerHTML = `
            <h2><i class="fas fa-search"></i> Menu Siswa</h2>
            <h3>Cari Buku</h3>
            <input type="text" id="searchBook" placeholder="Ketik judul buku">
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
            <h3>Buat Bank Soal</h3>
            <form id="quizForm">
                <input type="text" id="quizTitle" placeholder="Judul Quiz" required>
                <div id="questionsContainer"></div>
                <button type="button" onclick="addQuestion()">Tambah Soal</button>
                <button type="submit">Simpan Quiz</button>
            </form>
        `;
        document.getElementById('quizForm').addEventListener('submit', saveQuiz);
    } else if (currentRole === 'penjaga') {
        content.innerHTML = `
            <h2><i class="fas fa-cogs"></i> Menu Penjaga Perpustakaan</h2>
            <h3>Kelola Buku</h3>
            <form id="bookForm">
                <input type="text" id="bookTitle" placeholder="Judul Buku" required>
                <button type="submit">Tambah Buku</button>
            </form>
            <ul id="bookList"></ul>
        `;
        document.getElementById('bookForm').addEventListener('submit', addBook);
        displayBooks();
    }
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
}

// Fungsi untuk siswa: Cari buku
function searchBook() {
    const query = document.getElementById('searchBook').value.toLowerCase();
    const results = books.filter(book => book.title.toLowerCase().includes(query));
    const resultsDiv = document.getElementById('bookResults');
    resultsDiv.innerHTML = results.length ? results.map(book => 
        `<li>${book.title} - Status: ${book.available ? '<span style="color: green;">Tersedia</span>' : '<span style="color: red;">Dipinjam</span>'}</li>`
    ).join('') : '<p>Tidak ada buku ditemukan.</p>';
}

// Fungsi untuk siswa: Load quiz
function loadQuizzesForStudent() {
    const select = document.getElementById('quizSelect');
    select.innerHTML = '<option>Pilih Quiz</option>' + quizzes.map((quiz, index) => 
        `<option value="${index}">${quiz.title}</option>`
    ).join('');
}

// Fungsi untuk siswa: Mulai quiz
function startQuiz() {
    const index = document.getElementById('quizSelect').value;
    if (index === 'Pilih Quiz') return alert('Pilih quiz dulu!');
    const quiz = quizzes[index];
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    quiz.questions.forEach((q, i) => {
        container.innerHTML += `
            <div class="question">
                <p><strong>${q.question}</strong></p>
                ${q.options.map((opt, j) => `<label><input type="radio" name="q${i}" value="${j}"> ${opt}</label><br>`).join('')}
            </div>
        `;
    });
    container.innerHTML += `<button onclick="submitQuiz(${index})">Submit</button>`;
}

// Fungsi untuk siswa: Submit quiz
function submitQuiz(index) {
    const quiz = quizzes[index];
    let score = 0;
    quiz.questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && parseInt(selected.value) === q.correct) score++;
    });
    document.getElementById('quizContainer').innerHTML += `<div class="quiz-result">Nilai Anda: ${score}/${quiz.questions.length}</div>`;
}

// Fungsi untuk guru: Tambah soal
function addQuestion() {
    const container = document.getElementById('questionsContainer');
    const questionIndex = container.children.length;
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <h4>Soal ${questionIndex + 1}</h4>
        <input type="text" placeholder="Pertanyaan" required>
        <div class="options">
            <input type="text" placeholder="Opsi 1" required>
            <input type="text" placeholder="Opsi 2" required>
            <input type="text" placeholder="Opsi 3 (opsional)">
            <input type="text" placeholder="Opsi 4 (opsional)">
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

// Fungsi untuk guru: Hapus soal
function removeQuestion(button) {
    button.parentElement.remove();
}

// Fungsi untuk guru: Simpan quiz
function saveQuiz(e) {
    e.preventDefault();
    const title = document.getElementById('quizTitle').value;
    const questions = [];
    const questionDivs = document.querySelectorAll('.question');
    
    for (let div of questionDivs) {
        const question = div.querySelector('input[placeholder="Pertanyaan"]').value;
        const options = Array.from(div.querySelectorAll('.options input')).map(input => input.value).filter(opt => opt.trim() !== '');
        const correct = parseInt(div.querySelector('select').value);
        
        if (question && options.length >= 2 && !isNaN(correct)) {
            questions.push({ question, options, correct });
        } else {
            alert('Soal tidak lengkap! Pastikan ada pertanyaan, minimal 2 opsi, dan jawaban benar.');
            return;
        }
    }
    
    if (questions.length === 0) {
        alert('Tambahkan setidaknya satu soal!');
        return;
    }
    
    quizzes.push({ title, questions });
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    alert('Quiz disimpan!');
    document.getElementById('quizForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
}

// Fungsi untuk penjaga: Tambah buku
function addBook(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    books.push({ title, available: true });
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
    document.getElementById('bookForm').reset();
}

// Fungsi untuk penjaga: Tampilkan buku
function displayBooks() {
    const list = document.getElementById('bookList');
    list.innerHTML = books.map((book, index) => 
        `<li>${book.title} - ${book.available ? '<span style="color: green;">Tersedia</span>' : '<span style="color: red;">Dipinjam</span>'} 
        <button onclick="toggleBorrow(${index})">${book.available ? 'Tandai Dipinjam' : 'Tandai Kembali'}</button>
        <button onclick="deleteBook(${index})" style="background: #dc3545;">Hapus</button></li>`
    ).join('');
}

// Fungsi untuk penjaga: Toggle pinjam
function toggleBorrow(index) {
    books[index].available = !books[index].available;
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}

// Fungsi untuk penjaga: Hapus buku
function deleteBook(index) {
    books.splice(index, 1);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}
