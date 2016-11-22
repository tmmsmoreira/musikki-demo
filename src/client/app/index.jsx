import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router'

//import SearchLayout from './search.jsx'

var db = $.idb({
    name:'musikki',
    version: 1,
    drop: [],
    stores: [{
        name: "favorits",
        keyPath: ["mkid", "user"],
        autoIncrement: false,
        index: ["name", "image"],
        unique: [false, false]
    },
    {
        name: "users",
        keyPath: ["user", "password"],
        autoIncrement: false
    }]
});

var favorits = [];

var MainLayout = React.createClass({
    render: function() {
        return (
            <div className="container">
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="#">Musikki Favorites App</a>
                        </div>
                        <div id="navbar" className="navbar-collapse collapse">
                            <ul className="nav navbar-nav">
                                <NavLink to="/">Home</NavLink>
                                <NavLink to="login" dataWhen="logout">Login</NavLink>
                                <NavLink to="register" dataWhen="logout">Sign Up</NavLink>
                                <NavLink to="search" dataWhen="login">Search</NavLink>
                                <NavLink to="favorits" dataWhen="login">Favorits</NavLink>
                            </ul>
                            <ul className="nav navbar-nav pull-right">
                                <LogoutLink>Logout</LogoutLink>
                            </ul>
                        </div>
                    </div>
                </nav>
                <main>
                    {this.props.children}
                </main>
            </div>
        )
    }
})

var NavLink = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    render: function() {
        let isActive = this.context.router.isActive(this.props.to, true),
            isLoggedIn = localStorage.getItem('currentUser') && localStorage.getItem('currentUser') !== "" ? true : false,
            active = isActive ? "active" : "",
            hidden = "";

        switch(this.props.dataWhen) {
            case 'login':
                hidden = isLoggedIn ? "" : "hidden";
                break;
            case 'logout':
                hidden = isLoggedIn ? "hidden" :  "";
                break;
            default:
                hidden = "";
                break;
        }

        return (
            <li className={active + " " + hidden}>
                <Link to={this.props.to}>
                    {this.props.children}
                </Link>
            </li>
        );
    }
});

var LogoutLink = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    onClick() {
        var r = confirm("Are you sure you want to logout?");
        if (r === true) {
            localStorage.setItem('currentUser', "");
            hashHistory.push("/");
        }
        return;
    },
    render: function() {
      let isLoggedIn = localStorage.getItem('currentUser') && localStorage.getItem('currentUser') !== "" ? true : false,
        hidden = isLoggedIn ? "" : "hidden";

      return (
          <li>
              <a href="#" className={hidden} onClick={this.onClick}>
                  {this.props.children}
              </a>
          </li>
      );
    }
});

var HomePage = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    render: function() {
        return (
            <div className="container text-center">
                <h1>This is a test project to Musikki company.</h1>
            </div>
        );
    }
});

var SearchLayout = React.createClass({
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

var FavoritsLayout = React.createClass({
    getInitialState: function() {
        return {
            data: favorits
        };
    },
    artistOnClick: function(i) {
        deleteFavorite(favorits[i]);
        this.setState({
            data: this.state.data.filter(function (e, idx) {
                return idx !== i;
            })
        });
    },
    render: function() {
      var _this = this;

      return (
        <div className="favorits-layout">
            <div className="results-layout">
                {(this.state.data.length > 0
                    ?
                    <ul className="media-list">
                        {this.state.data.map(function(obj, i) {
                            var className = "glyphicon glyphicon-star";
                            return <ArtistLayout
                                image={obj.image}
                                name={obj.name}
                                mkid={obj.mkid}
                                key={i}
                                artistOnClick={_this.artistOnClick}
                                favClasses={className}
                                index={i}
                            />
                        })}
                    </ul>
                    :
                    <h2 className="text-center">There is no favorits to present.</h2>
                )}
            </div>
        </div>
      )
    }
});

var ArtistLayout = React.createClass({
    getInitialState: function() {
        return {
            data: favorits
        };
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    onClick: function(i) {
        this.props.artistOnClick(i);
    },
    handleFavClasses: function() {
        return "fav " + this.props.favClasses;
    },
    render: function() {
        let image = this.props.image,
            name = this.props.name,
            mkid = this.props.mkid,
            index = this.props.index;

        return (
            <li className="media artist" data-mkid={mkid} data-index={index}>
                <Link style={{ display: "inherit", cursor: "pointer" }} data-mkid={mkid} onClick={this.onClick.bind(this, index)}>
                    <div className="media-left">
                        <div className="text-center" style={{ width: '60px', height: "60px"}}>
                            <div className="media-object" style={{ backgroundImage: "url(" + image + ")"}}></div>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }} className="media-body">
                        <h4 className="media-heading">{name}</h4>
                        <span className={this.handleFavClasses()}></span>
                    </div>
                </Link>
            </li>
        );
    }
});

var AuthLayout = React.createClass({
    render: function() {
        return (
            <div className="auth">
                <header className="auth-header"></header>
                <div className="results">
                {this.props.children}
                </div>
            </div>
        )
    }
})

var LoginForm = React.createClass({
    ValidateLogin: function() {
        var user = this.refs.LoginUser.state.value;
        var password = this.refs.LoginPassword.state.value;
        Login(user, password).then(function(status) {
            if (status == "failed") {
                $(".bg-danger").toggleClass("invisible", false);
            }
        });
    },
    render() {
        return (
            <form className="form-signin">
                <p className="bg-danger invisible" style={{ padding: "10px" }}>Login has faild! Please try again.</p>
                <h2 className="form-signin-heading">Please sign in</h2>
                <UserField ref="LoginUser"/>
                <PasswordField ref="LoginPassword"/>
                <SignIn ValidateLogin={this.ValidateLogin}/>
                <a className="btn btn-lg btn-default btn-block" href="#/register">Sign up</a>
            </form>
        )
    }
});

var RegisterForm = React.createClass({
    ValidateRegister: function() {
        var user = this.refs.LoginUser.state.value;
        var password = this.refs.LoginPassword.state.value;
        Register(user, password);
    },
    render() {
        return (
            <form className="form-signin">
                <h2 className="form-signin-heading">Please sign up</h2>
                <UserField ref="LoginUser"/>
                <PasswordField ref="LoginPassword"/>
                <SignUp ValidateRegister={this.ValidateRegister}/>
            </form>
        )
    }
});

var UserField = React.createClass({
    getInitialState() {
        return {value: null}
    },
    onChange(e) {
        this.setState({value: e.target.value});
    },
    render() {
        return (
            <div className="LoginUserDiv">
                <label htmlFor="inputUser" className="sr-only">Username</label>
                <input type="text" id="inputUser" className="form-control" placeholder="Username" required="" onChange={this.onChange}/>
            </div>
        )
    }
});

var PasswordField = React.createClass({
    getInitialState() {
        return {value: null}
    },
    onChange(e) {
        this.setState({value: e.target.value});
    },
    render() {
        return (
            <div className="LoginPasswordDiv">
                <label htmlFor="inputPassword" className="sr-only">Password</label>
                <input type="password" id="inputPassword" className="form-control" placeholder="Password" required="" onChange={this.onChange}/>
            </div>
        )
    }
});

var SignIn = React.createClass({
    onClick() {
        this.props.ValidateLogin();
    },
    render() {
        return (
            <button className="btn btn-lg btn-primary btn-block" onClick={this.onClick}>Sign in</button>
        )
    }
});

var SignUp = React.createClass({
    onClick() {
        this.props.ValidateRegister();
    },
    render() {
        return (
            <a className="btn btn-lg btn-default btn-block" onClick={this.onClick}>Sign up</a>
        )
    }
});

function Login(user, password) {
    var deferred = $.Deferred();

    db.select("users", function([u, p], value) {
        return (u == user && p == password);
    }).done(function(items) {
        if (items.length > 0) {
            localStorage.setItem('currentUser', user);
            getFavorits().then(function(items) {
                deferred.resolve("success");
                favorits = items;
                hashHistory.push("/");
            });
        } else {
            deferred.resolve("failed");
        }
    });

    return deferred.promise();
};

function Register(user, password) {
    var data = {
        "user": user,
        "password": password,
    };

    db.put(data, "users").done(function() {
        hashHistory.push("/login");
    });
};

function getFavorits() {
    var user = localStorage.getItem('currentUser');

    var deferred = $.Deferred();

    db.select("favorits", function([m, u], value) {
        return u == user;
    }).done(function(items) {
        deferred.resolve(items);
    });

    return deferred.promise();
};

function favoriteExists(mkid) {
    var user = localStorage.getItem('currentUser');
    var deferred = $.Deferred();

    db.select("favorits", function([m, u], value) {
        return (m == mkid && u == user);
    }).done(function(items) {
        deferred.resolve(items.length > 0);
    });

    return deferred.promise();
};

function addFavorite(props) {
    var user = localStorage.getItem('currentUser');
    var data = {
        "mkid": props.mkid,
        "user": user,
        "name": props.name,
        "image": props.image,
    };

    db.put(data, 'favorits').done(function() {
        favorits[data.mkid] = data;
    });
};

function deleteFavorite(props) {
    var user = localStorage.getItem('currentUser');

    db.remove('favorits', function([m, u], value) {
        return (m == props.mkid && u == user);
    }).done();
};

getFavorits().then(function(items) {
    favorits = items;

    ReactDOM.render((
        <Router history={hashHistory}>
            <Route path="/" component={MainLayout}>
                <IndexRoute component={HomePage} />
                <Route component={AuthLayout}>
                    <Route path="/login" component={LoginForm} />
                    <Route path="/register" component={RegisterForm} />
                </Route>
                <Route>
                    <Route path="/search" component={SearchLayout} />
                    <Route path="/favorits" component={FavoritsLayout} />
                </Route>
            </Route>
        </Router>
    ), document.getElementById('app'));
});
