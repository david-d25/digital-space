import React, {useState} from "react";

import "./books.scss";

import books from "@/data/books";
import AnimateHeight from "react-animate-height";
import FlippingViewButton from "@/component/flip-popup-trigger/FlippingViewButton";

export default class Books extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInput: "",
            popupActive: false,
            popupBook: null,
            filters: {
                statusOneOf: null,
                hideGeekyItBooks: true
            }
        }
    }

    render() {
        return (
            <div className="books-wr">
                <div className="container">
                    <div className="books">
                        <h1 className="title">Library</h1>
                        <SearchBar
                            value={this.state.searchInput}
                            onInput={e => this.onSearch(e.target.value)}
                        />
                        <SearchFilters
                            filters={this.state.filters}
                            onFiltersChange={filters => this.setState({filters})}
                        />
                        <BookList
                            books={books}
                            filters={this.state.filters}
                            searchFilter={this.state.searchInput}
                            onBookClick={this.openBookPopup}
                        />
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQueryParam = urlParams.get('q');
        const bookIdQueryParam = urlParams.get('bookId');

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

function SearchBar(props) {
    return (
        <div className="search-bar">
            <input  className="search-bar__input"
                    placeholder="Search"
                    name="search"
                    value={props.value}
                    onInput={e => props.onInput(e)}
            />
        </div>
    );
}

function SearchFilters(props) {
    const [ opened, setOpened ] = useState(false);

    let { statusOneOf, hideGeekyItBooks } = props.filters;
    let { onFiltersChange } = props;

    const statusNames = {
        'have read': 'Have read',
        'reading': 'Reading currently',
        'in queue': 'In queue',
        'shelved': 'Shelved'
    }

    function onStatusOneOfChange(status, enabled) {
        if (statusOneOf == null)
            statusOneOf = Object.keys(statusNames);
        const newStatuses = enabled ? [...statusOneOf, status] : statusOneOf.filter(s => s !== status);
        onFiltersChange({ ...props.filters, statusOneOf: newStatuses });
    }

    return (
        <div className={`search-filters ${ opened ? 'opened' : ''}`}>
            <AnimateHeight duration={300} height={opened ? 'auto' : 0}>
                <div className={`search-filters__content ${opened && 'opened'}`}>
                    <div className="search-filters__filter-title">Book status:</div>
                    <label className="search-filters__item">
                        <input
                            type="checkbox"
                            checked={statusOneOf == null || Object.keys(statusNames).every(status => statusOneOf.includes(status))}
                            onChange={e => onFiltersChange({ ...props.filters, statusOneOf: e.target.checked ? null : [] })}
                        />
                        <span>All</span>
                    </label>
                    { Object.keys(statusNames).map(status => (
                        <label className="search-filters__item" key={status}>
                            <input
                                type="checkbox"
                                checked={statusOneOf == null || statusOneOf.includes(status)}
                                onChange={e => onStatusOneOfChange(status, e.target.checked)}
                            />
                            <span>{statusNames[status]}</span>
                        </label>
                    ))}
                    <div className="search-filters__filter-title">Other:</div>
                    <label className="search-filters__item">
                        <input
                            type="checkbox"
                            checked={hideGeekyItBooks}
                            onChange={e => props.onFiltersChange({ ...props.filters, hideGeekyItBooks: e.target.checked })}
                        />
                        <span>Hide geeky IT books</span>
                    </label>
                </div>
            </AnimateHeight>
            {opened &&
                <button className="search-filters__hide" onClick={() => setOpened(false)}>Hide filters</button>
                ||
                <button className="search-filters__show" onClick={() => setOpened(true)}>Show filters</button>
            }
        </div>
    );
}

function BookList(props) {
    const filteredBooks = filterBooks(props.books, props.searchFilter, props.filters);
    return (
        <div className="book-list">
            {filteredBooks.map(book => <BookCard book={book} key={book.id}/>)}
            {!filteredBooks.length && <div className=".book-list__no-results">No results</div>}
        </div>
    )
}

function BookCard(props) {
    const book = props.book;
    const [open, setOpen] = useState(false);
    const details = <BookDetails book={book}/>;
    return (
        <FlippingViewButton open={open} onClose={() => setOpen(false)} popupContent={details}>
            <div className="book-item" onClick={() => setOpen(true)}>
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
        </FlippingViewButton>
    );
}

function BookDetails(props) {
    const { book } = props
    if (book) {
        return (
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
                            <div className="book-popup__label">Comment</div>
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
        );
    } else {
        return (
            <div className="book-popup">
                <div className="book-popup__centered-message">
                    Book not found :(
                </div>
            </div>
        );
    }
}

function filterBooks(books, query, filters) {
    return books.filter(b => bookFilter(b, query, filters));
}

function bookFilter(book, query, filters) {
    const passedSearch = (
        !query ||
        book.name && book.name.toLowerCase().includes(query.toLowerCase()) ||
        book.authors.some(author => author.toLowerCase().includes(query.toLowerCase())) ||
        book.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    const passedFilters = (
        !filters.statusOneOf ||
        filters.statusOneOf.includes(book.status)
    ) && (
        !filters.hideGeekyItBooks ||
        !book.tags.includes('information technology')
    );
    return passedSearch && passedFilters;
}