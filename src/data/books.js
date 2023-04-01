const books = [
    {
        id: 0,
        name: "Modern Operating Systems",
        edition: "4th edition",
        authors: ["Andrew S. Tanenbaum", "Herbert Bos"],
        year: 2015,
        isbn: "978-5-496-01395-6",
        language: "Russian",
        coverImage: "data/book-cover/id0.jpg",
        comment: "This book gives a good general understanding of how operating systems work. The first half of book covers the historical aspect of operating systems' evolution. The other half covers the practical implementation of their different parts. Overall, it's not too hard to read, I would recommend it for anyone who is curious.",
        status: "have read"
    }, {
        id: 1,
        name: "Storynomics",
        edition: null,
        authors: ["Robert McKee", "Thomas Gerace"],
        year: 2019,
        isbn: "978-5-91671-947-5",
        language: "Russian",
        coverImage: "data/book-cover/id1.jpg",
        comment: "This book explains why some stories are more interesting than others, how it is connected with the survival of ancient people and how companies use it to create product ecosystems in the modern post-advertising world. Very easy and fun to read, I recommend it.",
        status: "have read"
    }, {
        id: 2,
        name: "Introduction to Microcomputers",
        edition: null,
        authors: ["S. A. Mayorov", "V. V. Kirillov", "A. A. Pribluda"],
        year: 1988,
        isbn: null,
        language: "Russian",
        coverImage: "data/book-cover/id2.png",
        comment: "A book of Legendary level 🔥",
        status: "have read"
    }, {
        id: 3,
        name: "The Fabric of Reality",
        edition: null,
        authors: ["David Deutsch"],
        year: 2005,
        isbn: "978-978-5-91671-841-6",
        language: "Russian",
        coverImage: "data/book-cover/id3.jpg",
        comment: "Quite a specific book. This book explains this world using a mix of four fundamental things: epistemology, quantum mechanics, theory of computation, and the universal theory of evolution. Some chapters are easy to read, some are hard. I'm not sure I fully understand it. The books covers a wide range of things, and may change how you see the world. The parallel universes in the context of this book are not the ones shown in movies.",
        status: "have read"
    }, {
        id: 4,
        name: "Game Design",
        edition: null,
        authors: ["Jesse Schell"],
        year: 2019,
        isbn: "978-5-9614-2512-3",
        language: "Russian",
        coverImage: "data/book-cover/id4.jpg",
        comment: "I'm not a game designer, so I've read this book just out of curiosity, but it has far exceeded my expectations. It is indeed a splendid book for anyone who is interested in how (not only computer) games work. You don't have to make games to have fun reading this book.",
        status: "have read"
    }, {
        id: 5,
        name: "Architecture of The Base Computer",
        edition: null,
        authors: ["V. V. Kirillov"],
        year: 2010,
        isbn: null,
        language: "Russian",
        coverImage: "data/book-cover/id5.png",
        comment: "Don't even think about reading this if you're not a hardware engineer :))",
        status: "have read"
    }, {
        id: 6,
        name: "Grokking Algorithms",
        edition: null,
        authors: ["Aditya Bhargava"],
        year: 2017,
        isbn: "978-5-496-02541-6",
        language: "Russian",
        coverImage: "data/book-cover/id6.jpg",
        comment: "Just a good book to learn algorithms casually. It uses nice drawn pictures and Python examples. If you're new to programming, this book is good for you.",
        status: "have read"
    }, {
        id: 7,
        name: "Thinking in Java",
        edition: "4th edition",
        authors: ["Bruce Eckel"],
        year: 2015,
        isbn: "978-5-496-01127-3",
        language: "Russian",
        coverImage: "data/book-cover/id7.jpg",
        comment: "A good book covering a wide variety of Java stuff, no comments.",
        status: "have read"
    }, {
        id: 8,
        name: "Compilers",
        edition: "2nd edition",
        authors: ["Alfred V. Acho", "Monica S. Lam", "Ravi Sethi", "Jeffrey D. Ullman"],
        year: 2008,
        isbn: "978-5-8459-1349-4",
        language: "Russian",
        coverImage: "data/book-cover/id8.png",
        comment: "I'm not a compiler engineer, so I've read this book just out of curiosity. It's quite hard to read and understand everything, but it gave me some basic understanding of what methods and principles do compilers use to work.",
        status: "have read"
    }, {
        id: 9,
        name: "Hoolinomics",
        edition: "v3.2",
        authors: ["Alexey Markov"],
        year: 2019,
        isbn: "978-5-17-113704-5",
        language: "Russian",
        coverImage: "data/book-cover/id9.jpg",
        comment: "Well, I can't say I became a pro economist reading this, but it was definitely a very fun and interesting book. You can read this even if you don't give a damn about economics.",
        status: "have read"
    }, {
        id: 10,
        name: "Data Structures & Algorithms in Java",
        edition: "2nd edition",
        authors: ["Robert Lafore"],
        year: 2003,
        isbn: "0-672-32453-9",
        language: "English",
        coverImage: "data/book-cover/id10.jpg",
        comment: null,
        status: "have read"
    }, {
        id: 11,
        name: "Game Design: Theory & Practice",
        edition: "2nd edition",
        authors: ["Richard Rouse III"],
        year: 2005,
        isbn: "1-55622-912-7",
        language: "English",
        coverImage: "data/book-cover/id11.jpg",
        comment: null,
        status: "have read"
    }, {
        id: 12,
        name: "Nginx From Beginner to Pro",
        edition: null,
        authors: ["Rahul Soni"],
        year: 2016,
        isbn: "978-1-4842-1656-9",
        language: "English",
        coverImage: "data/book-cover/id12.jpg",
        comment: null,
        status: "have read"
    }, {
        id: 13,
        name: "Cognitive Behavior Therapy",
        edition: "2nd edition",
        authors: ["Judith S. Beck"],
        year: 2018,
        isbn: "978-5-4461-0552-6",
        language: "Russian",
        coverImage: "data/book-cover/id13.jpg",
        comment: "Despite this book being written for therapists, it's very easy to read and it has a lot of good tips and methods for solving cognitive problems. Though you should find a real therapist anyway if you have depression or anything alike.",
        status: "have read"
    }, {
        id: 14,
        name: "Pro Spring 5",
        edition: "5th edition",
        authors: ["Iuliana Cosmina", "Rob Harrop", "Chris Schaefer", "Clarence Ho"],
        year: 2017,
        isbn: "978-1-4842-2808-1",
        language: "English",
        coverImage: "data/book-cover/id14.jpg",
        comment: "As always, Apress published a very good high-quality learning material. If you know Java, but you're new to DI & IoC, this book is for you. It uses a guided discovery learning method where you first 'invent' Spring Framework by yourself at the beginning of the book, which I consider a very good way of learning things.",
        status: "have read"
    }, {
        id: 15,
        name: "Low-Level Programming",
        edition: null,
        authors: ["Igor Zhirkov"],
        year: 2017,
        isbn: "978-1-4842-2403-8",
        language: "English",
        coverImage: "data/book-cover/id15.jpg",
        comment: null,
        status: "have read"
    }, {
        id: 16,
        name: "Getting Started with Hazelcast",
        edition: null,
        authors: ["Mat Johns"],
        year: 2013,
        isbn: "978-1-78216-730-3",
        language: "English",
        coverImage: "data/book-cover/id16.jpg",
        comment: null,
        status: "have read"
    }, {
        id: 17,
        name: "C++ in One Hour a Day",
        edition: "8th edition",
        authors: ["Siddhartha Rao"],
        year: 2016,
        isbn: "978-0-7897-5774-6",
        language: "English",
        coverImage: "data/book-cover/id17.jpg",
        comment: null,
        status: "have read"
    }
]

export default books;