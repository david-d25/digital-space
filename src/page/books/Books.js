import React from "react";

import "./books.scss";

import books from "@/data/books"
import qs from "query-string"
import Popup from "../../component/popup/Popup";

export default class Books extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInput: "",
            popupActive: false,
            popupBook: null
        }
    }

    render() {
        return (
            <div className="books-wr">
                <div className="container">
                    <div className="books">
                        <h1 className="title">My Library</h1>
                        <SearchBar  value={this.state.searchInput}
                                    onInput={e => this.onSearch(e.target.value)}/>
                        <BookList   books={books}
                                    searchFilter={this.state.searchInput}
                                    onBookClick={this.openBookPopup}/>
                        <BookDetailsPopup   book={this.state.popupBook}
                                            active={this.state.popupActive}
                                            onCloseClick={this.closePopup}/>
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        const urlParams = qs.parse(window.location.search);
        const searchQueryParam = urlParams.q;
        const bookIdQueryParam = urlParams.bookId;
        if (searchQueryParam) {
            this.setState({
                searchInput: decodeURIComponent(searchQueryParam)
            });
        }
        if (bookIdQueryParam) {
            const book = books.find(b => b.id.toString() === bookIdQueryParam);
            this.openBookPopup(book);
        }
        this.updateTitle();
    }

    onSearch = (query) => {
        this.setState({
            searchInput: query
        });
    }

    openBookPopup = (book) => {
        this.setState({
            popupActive: true,
            popupBook: book
        });
    }

    closePopup = () => {
        this.setState({
            popupActive: false
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateUrl();
        this.updateTitle();
    }

    updateTitle() {
        let title = "Books";
        const { popupBook, popupActive } = this.state;
        if (popupActive && popupBook != null)
            title = popupBook.name;
        document.title = title;
    }

    updateUrl() {
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        url.searchParams.delete('bookId');
        if (this.state.searchInput)
            url.searchParams.set('q', this.state.searchInput);
        if (this.state.popupActive && this.state.popupBook)
            url.searchParams.set('bookId', this.state.popupBook.id);
        window.history.replaceState(null, null, url);
    }
}

function BookDetailsPopup(props) {
    const { active, book, onCloseClick } = props
    return (
        <Popup active={active} onCloseClick={onCloseClick}>
            { book ? (
                <div className="book-popup">
                    <div className="book-popup__title">
                        {book.name} ({book.year})
                        {book.edition && <div className="book-popup__edition">{book.edition}</div>}
                    </div>
                    <div className="book-popup__media">
                        <img className="book-popup__book-cover" src={book.coverImage} alt={book.name}></img>
                    </div>
                    <div className="book-popup__info">
                        <div className="book-popup__block">
                            <div className="book-popup__label">Status</div>
                            { book.status === "have read" && (
                                <div className="book-popup__status green">Have read</div>
                            ) || book.status === "reading" && (
                                <div className="book-popup__status blue">Reading currently</div>
                            ) || (
                                <div className="book-popup__status">{book.status}</div>
                            )}
                        </div>
                        { book.comment &&
                            <div className="book-popup__block book-popup__comment-block">
                                <div className="book-popup__label">David's thoughts</div>
                                <div className="book-popup__comment">
                                    {book.comment}
                                </div>
                            </div>
                        }
                        <div className="book-popup__block">
                            <div className="book-popup__label">Authors</div>
                            <div className="book-popup__authors">
                                {book.authors.map(a => <div className="book-popup__author" key={a}>{a}</div>)}
                            </div>
                        </div>
                        <div className="book-popup__block">
                            <div className="book-popup__label"></div>
                            <div className="book-popup__language">This book is in {book.language}</div>
                        </div>
                        <div className="book-popup__block">
                            {book.isbn && <div className="book-popup__isbn">ISBN {book.isbn}</div>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="book-popup">
                    <div className="book-popup__centered-message">
                        Book not found :(
                    </div>
                </div>
            )}
        </Popup>
    )
}

function SearchBar(props) {
    return (
        <div className="search-bar">
            <input  className="search-bar__input"
                    placeholder="Search"
                    value={props.value}
                    onInput={e => props.onInput(e)}
            />
        </div>
    )
}

function BookList(props) {
    const filteredBooks = filterBooks(props.books, props.searchFilter);
    return (
        <div className="book-list">
            {filteredBooks.map(book =>
                <BookCard book={book} key={book.id} onClick={() => props.onBookClick(book)}/>
            )}
            {!filteredBooks.length && <div className=".book-list__no-results">No results</div>}
        </div>
    )
}

function BookCard(props) {
    const book = props.book;
    return (
        <div className="book-item" onClick={props.onClick}>
            { book.status &&
                <div className={`book-item__status ${book.status === 'have read' && 'green'} ${book.status === 'reading' && 'blue'}`}>
                    {book.status}
                </div>
            }
            <div className="book-item__img-wr">
                <img className="book-item__img" src={book.coverImage} alt={book.name}/>
            </div>
            <div className="book-item-info">
                <div className="book-item-info__title">
                    {book.name}
                </div>
                {book.edition && <div className="book-item-info__edition">, {book.edition}</div>}
                <div className="book-item-info__author-list">
                    {book.authors.map(author => <div className="book-item-info__author" key={author}>{author}</div>)}
                </div>
            </div>
        </div>
    );
}

function filterBooks(books, query) {
    return books.filter(b => bookFilter(b, query));
}

function bookFilter(book, query) {
    return (
        !query ||
        book.name && book.name.toLowerCase().includes(query.toLowerCase()) ||
        book.authors.some(author => author.toLowerCase().includes(query.toLowerCase()))
    );
}