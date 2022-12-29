import React from "react";

import "style/library.css";

import books from "data/books"
import qs from "query-string"
import { Link } from "react-router-dom";

export default class Library extends React.Component {
    constructor(props) {
        super(props);
        const urlParams = qs.parse(window.location.search);
        this.state = {
            searchInput: urlParams.q || "",
            popupTargetBook: null
        }
    }

    render() {
        return (
            <div className="library-wr">
                <div className="container">
                    <div className="library">
                        <Link to="/" className="to-home-link">&lt; Home</Link>
                        <h1 className="title">My Library</h1>
                        <SearchBar  value={this.state.searchInput}
                                    onInput={e => this.setState({searchInput: e.target.value})}/>
                        <BookList   books={books}
                                    searchFilter={this.state.searchInput}
                                    onBookClick={book => this.setState({popupTargetBook: book})}/>
                        <BookDetailsPopup   targetBook={this.state.popupTargetBook}
                                            onCloseClick={() => this.setState({popupTargetBook: null})}/>
                    </div>
                </div>
            </div>
        )
    }
}

function BookDetailsPopup(props) {
    const book = props.targetBook
    return (
        book && 
            <div className={`popup-wr ${book ? 'active' : ''}`}>
                <div className="popup-backstage" onClick={props.onCloseClick}></div>
                <div className="popup">
                    <div className="popup__close-button" onClick={props.onCloseClick}></div>
                    <div className="popup__title">
                        {book.name} ({book.year})
                        {book.edition && <div className="popup__edition">{book.edition}</div>}
                    </div>
                    <div className="popup__img-wr">
                        <img className="popup__img" src={book.coverImage} alt={book.name}></img>
                    </div>
                    <div className="popup__info">
                        <div className="popup__block">
                            <div className="popup__label">Status:</div>
                            {book.status === "have read" && <div className="popup__status green">Have read this</div>}
                            {book.status === "reading" && <div className="popup__status blue">Reading this currently</div>}
                        </div>
                        <div className="popup__block">
                            <div className="popup__label">Authors:</div>
                            <div className="popup__authors">
                                {book.authors.map(a => <div className="popup__author" key={a}>{a}</div>)}
                            </div>
                        </div>
                        <div className="popup__block">
                            <div className="popup__language">Language: {book.language}</div>
                            {book.isbn && <div className="popup__isbn">ISBN {book.isbn}</div>}
                        </div>
                    </div>
                </div>
            </div>
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
    const filteredBooks = filterBooks(props.books, props.searchFilter)
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
    const book = props.book
    return (
        <div className="book-item" onClick={props.onClick}>
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
    )
}

function filterBooks(books, query) {
    return books.filter(b => bookFilter(b, query))
}

function bookFilter(book, query) {
    return !query || (book.name && book.name.toLowerCase().includes(query.toLowerCase()));
}