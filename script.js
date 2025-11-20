// Tambahkan variabel global baru untuk fasilitas dan jadwal
let fasilitasList = [
    "LabKom 1", "LabKom 2", "LabKom 3", "LabKom 4",
    "Lab Kimia", "Lab Biologi", "Lab Fisika", "PKWU",
    "Perpustakaan", "Mushola", "Lapangan Basket", "Lapangan Voli",
    "Aula 1", "Aula 2"
];
// Struktur jadwal: { fasilitas, tanggal, jam (1-10), status, guru, mapel, kelas }
let jadwalFasilitas = JSON.parse(localStorage.getItem('jadwalFasilitas')) || [];

// Fungsi set role diperbarui agar ada opsi fasilitas
function setRole(role) {
    currentRole = role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    loadContent();
}

// Fungsi render konten berdasarkan role termasuk fasilitas baru
function loadContent() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (currentRole === 'siswa') {
        // Sama seperti sebelumnya
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
        // Sama seperti sebelumnya
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
        // Sama seperti sebelumnya
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
        document.getElementById('selectFasilitas').addEventListener('change', renderJadwalFasilitas);
    }
}

function loadFasilitasOptions() {
    const select = document.getElementById('selectFasilitas');
    select.innerHTML = '<option value="">--Pilih Fasilitas--</option>' + fasilitasList.map(f => `<option value="${f}">${f}</option>`).join('');
}

function renderJadwalFasilitas() {
    const fasil = document.getElementById('selectFasilitas').value;
    const container = document.getElementById('jadwalContainer');

    if (!fasil) {
        container.innerHTML = '';
        return;
    }

    // Ambil semua booking slot fasilitas terpilih (hari ini sebagai default bisa dirubah manual)
    let hariIni = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

    // Filter jadwal hanya fasilitas ini dan hari ini / bisa dikembangkan untuk pilih tanggal
    let jadwalHariIni = jadwalFasilitas.filter(j => j.fasilitas === fasil && j.tanggal === hariIni);

    const getStatusSlot = (jam) => {
        let slot = jadwalHariIni.find(j => j.jam === jam);
        if (!slot) return "Kosong";
        return slot.status === "booking" ? "Digunakan" : slot.status || "Kosong";
    };

    // Buat tabel jadwal 10 slot jam
    let html = `<h3>Jadwal untuk ${fasil} pada tanggal <input type="date" id="tanggalJadwal" value="${hariIni}"/></h3>`;
    html += `<table border="1" cellpadding="8" cellspacing="0" style="width:100%; max-width:600px;">
        <thead>
            <tr>
                <th>Jam Ke-</th>
                <th>Status</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
    `;
    for (let jam=1; jam<=10; jam++) {
        let slot = jadwalHariIni.find(j => j.jam === jam);
        html += `<tr>
            <td>${jam}</td>
            <td>${slot ? slot.status === "booking" ? "Digunakan" : slot.status : "Kosong"}</td>
            <td>
                <button onclick="openBookingForm('${fasil}',${jam})">${slot ? slot.status === "booking" ? "Edit Booking" : "Booking" : "Booking"}</button>
                ${slot ? `<button onclick="hapusBooking('${fasil}',${jam})" style="background:#dc3545;margin-left:10px;">Batalkan</button>` : ''}
            </td>
        </tr>`;
    }
    html += `</tbody></table>`;
    html += `<div id="bookingFormContainer"></div>`;

    container.innerHTML = html;

    // Event listener untuk perubahan tanggal agar reload jadwal sesuai tanggal
    document.getElementById('tanggalJadwal').addEventListener('change', (e) => {
        renderJadwalFasilitasTanggal(fasil, e.target.value);
    });
}

function renderJadwalFasilitasTanggal(fasil, tanggal) {
    // Render jadwal mirip renderJadwalFasilitas tapi pake tanggal parameter
    const container = document.getElementById('jadwalContainer');
    
    // Filter jadwal slot fasilitas dan tanggal
    let jadwalPerTanggal = jadwalFasilitas.filter(j => j.fasilitas === fasil && j.tanggal === tanggal);

    let html = `<h3>Jadwal untuk ${fasil} pada tanggal <input type="date" id="tanggalJadwal" value="${tanggal}"/></h3>`;
    html += `<table border="1" cellpadding="8" cellspacing="0" style="width:100%; max-width:600px;">
        <thead>
            <tr>
                <th>Jam Ke-</th>
                <th>Status</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
    `;
    for (let jam=1; jam<=10; jam++) {
        let slot = jadwalPerTanggal.find(j => j.jam === jam);
        html += `<tr>
            <td>${jam}</td>
            <td>${slot ? slot.status === "booking" ? "Digunakan" : slot.status : "Kosong"}</td>
            <td>
                <button onclick="openBookingForm('${fasil}',${jam})">${slot ? slot.status === "booking" ? "Edit Booking" : "Booking" : "Booking"}</button>
                ${slot ? `<button onclick="hapusBooking('${fasil}',${jam})" style="background:#dc3545;margin-left:10px;">Batalkan</button>` : ''}
            </td>
        </tr>`;
    }
    html += `</tbody></table>`;
    html += `<div id="bookingFormContainer"></div>`;
    container.innerHTML = html;

    document.getElementById('tanggalJadwal').addEventListener('change', (e) => {
        renderJadwalFasilitasTanggal(fasil, e.target.value);
    });
}

// Fungsi tampilkan form booking atau edit booking
function openBookingForm(fasilitas, jam) {
    const container = document.getElementById('bookingFormContainer');
    const tanggalInput = document.getElementById('tanggalJadwal');
    const tanggal = tanggalInput ? tanggalInput.value : new Date().toISOString().slice(0,10);

    // Cari jika sudah ada booking slot ini utk edit
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

    document.getElementById('formBookingFasilitas').addEventListener('submit', function(e) {
        e.preventDefault();
        const guru = document.getElementById('inputGuru').value.trim();
        const mapel = document.getElementById('inputMapel').value.trim();
        const kelas = document.getElementById('inputKelas').value.trim();
        if(!guru || !mapel || !kelas) {
            alert('Semua data harus diisi!');
            return;
        }

        // Update jadwal atau tambah baru
        let idx = jadwalFasilitas.findIndex(j=>j.fasilitas===fasilitas && j.jam===jam && j.tanggal===tanggal);
        if(idx!==-1) {
            jadwalFasilitas[idx].status = 'booking';
            jadwalFasilitas[idx].guru = guru;
            jadwalFasilitas[idx].mapel = mapel;
            jadwalFasilitas[idx].kelas = kelas;
        } else {
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

// Fungsi batal dan sembunyikan form booking
function batalBookingForm() {
    document.getElementById('bookingFormContainer').innerHTML = '';
}

// Fungsi batalkan booking tertentu
function hapusBooking(fasilitas, jam) {
    const tanggalInput = document.getElementById('tanggalJadwal');
    const tanggal = tanggalInput ? tanggalInput.value : new Date().toISOString().slice(0,10);

    if (!confirm(`Batalkan booking ${fasilitas} jam ke-${jam} tanggal ${tanggal}?`)) return;

    let idx = jadwalFasilitas.findIndex(j => j.fasilitas === fasilitas && j.jam === jam && j.tanggal === tanggal);
    if (idx !== -1) {
        jadwalFasilitas.splice(idx, 1);
        localStorage.setItem('jadwalFasilitas', JSON.stringify(jadwalFasilitas));
        alert('Booking berhasil dibatalkan.');
        renderJadwalFasilitasTanggal(fasilitas, tanggal);
        batalBookingForm();
    }
}

// --- Fungsi lain tetap sama, seperti addBook(), searchBook(), dll ---

// Jangan lupa tambahkan fungsi goHome() jika belum ada:
function goHome() {
    currentRole = '';
    document.getElementById('content').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    document.getElementById('content').innerHTML = '';
}
