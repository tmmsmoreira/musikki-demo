import React from 'react';
import ArtistLayout from './artist.jsx';

module.exports = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            loading: false,
            searchWasMade: false
        };
    },
    isLoadingActive: function() {
        return this.state.loading ? "show" : "hidden";
    },
    isMediaListActive: function() {
        return "media-list " + (this.state.loading ? "hidden" : "show");
    },
    handleSearchChange: function(e) {
        this.setState({search: e.target.value});
    },
    getFavClasses: function(obj) {
        var pos = favorits.map(function(row) { return row.mkid; }).indexOf(obj.mkid);
        return "glyphicon " + (pos < 0 ? "glyphicon-star-empty" : "glyphicon-star");
    },
    artistOnClick: function(i) {
        var _this = this;
        favoriteExists(_this.state.data[i].mkid).then(function(flag) {
            if (flag) {
                $(".media .fav").eq(i).removeClass("glyphicon-star").addClass("glyphicon-star-empty");
                deleteFavorite(_this.state.data[i]);
            } else {
                $(".media .fav").eq(i).removeClass("glyphicon-star-empty").addClass("glyphicon-star");
                addFavorite(_this.state.data[i]);
            }
        });
    },
    loadResultsFromServer: function(e) {
        e.preventDefault();
        this.setState({
            loading: true,
            searchWasMade: true
        });

        var url = "https://music-api.musikki.com/v1/artists?q=[artist-name:"+this.state.search+"]&appkey=123456789&appid=123456789";

        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
        success: function(data) {
            this.setState({
                loading: false,
                data: data.results
            });
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(url, status, err.toString());
        }.bind(this)});
    },
    render: function() {
        var _this = this;
        var noResultsClasses = "";

        if (this.state.searchWasMade && !this.state.loading) {
            noResultsClasses = "text-center";
        } else {
            noResultsClasses = "text-center hidden";
        }

        return (
            <div className="search-layout">
                <div className="container-fluid">
                    <form className="form-inline text-center" onSubmit={this.loadResultsFromServer}>
                        <div className="form-group">
                            <label className="sr-only" htmlFor="searchInput">Search</label>
                            <div className="input-group">
                                <span className="input-group-addon" id="search">
                                    <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
                                </span>
                                <input type="text" className="form-control" id="searchInput" placeholder="Search artist" aria-describedby="search" onChange={this.handleSearchChange}/>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <div className="results-layout">
                        <div id="my-loader" className={this.isLoadingActive()}>
                            <div className="loader">
                                <div className="bounce1"></div>
                                <div className="bounce2"></div>
                                <div className="bounce3"></div>
                            </div>
                        </div>
                        {(this.state.data.length > 0
                            ?
                            <ul className={this.isMediaListActive()}>
                                {this.state.data.map(function(obj, i) {
                                    return <ArtistLayout
                                        image={obj.image}
                                        name={obj.name}
                                        mkid={obj.mkid}
                                        key={i}
                                        artistOnClick={_this.artistOnClick}
                                        favClasses={_this.getFavClasses(obj)}
                                        index={i}
                                    />
                                })}
                            </ul>
                            :
                            <h2 className={noResultsClasses}>No results.</h2>
                        )}
                    </div>
                </div>
            </div>
        )
    }
});
