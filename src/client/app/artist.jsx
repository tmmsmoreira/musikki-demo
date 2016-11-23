import React from 'react';

module.exports = React.createClass({
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
