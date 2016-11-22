import React, { Component, PropTypes } from 'react';
import './Podcast.css';

export default class Podcast extends Component {
    static propTypes = {
        url: PropTypes.string.isRequired,
        max: PropTypes.number
    }

    defaultProps = {
        url: "",
        max: -1
    }

    state = {
        title: "",
        link: "",
        description: "",
        imageUrl: "",
        episodes: [],
        colors: {
            bgColor: "#fff",
            titleTextColor: "#000",
            bodyTextColor: "#000"
        }
    }

    update() {
        fetch(`http://localhost:3001/podcast?url=${this.props.url}&max=${this.props.max || -1}`)
            .then(response => {
                if (! response.ok) {
                    throw new TypeError('Ruh roh');
                }

                return response.json();
            })
            .then(parsed => this.store(parsed))
            .catch(error => { 
                debugger; 
            });
    }

    getDurationString(duration) {
        let timeComponent = [];

        if (duration.hours > 0) {
            if (duration.hours < 10) {
                timeComponent.push(`0${duration.hours}`);
            } else {
                timeComponent.push(`${duration.hours}`);
            }
        }

        if (duration.minutes > 0) {
            if (duration.minutes < 10) {
                timeComponent.push(`0${duration.minutes}`);
            } else {
                timeComponent.push(`${duration.minutes}`);
            }
        }

        if (duration.seconds > 0) {
            if (duration.seconds < 10) {
                timeComponent.push(`0${duration.seconds}`);
            } else {
                timeComponent.push(`${duration.seconds}`);
            }
        }

        return timeComponent.join(":");
    }

    store(data) {
        this.setState({ lastUpdated: new Date().getTime(), ...data });
    }

    componentWillMount() {
        this.update();
    } 

    renderEpisode(episode) {
        return (
            <li key={episode.guid}>
                <h4 className="Podcast-Episode-Title">{episode.title}</h4>
                <p>{episode.shortDescription}</p>
                <p><small>Length: {this.getDurationString(episode.duration)}</small></p>
                <p><small>Published: {new Date(episode.pubDate).toLocaleDateString()}</small></p>
            </li>
        );
    }

    renderEpisodes() {
        const episodes = this.props.max > -1 ? this.state.episodes.slice(0, this.props.max) : this.state.episodes;
        return (
            <div>
                <h3>Latest Episodes</h3>
                <ul className="Podcast-Episodes">
                    {episodes.map(episode => this.renderEpisode(episode))}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <div className="Podcast" style={{ backgroundColor: this.state.colors.bgColor, color: this.state.colors.bodyTextColor }}>
                <h2 className="Podcast-Title">
                    <a href={this.state.link} style={{ color: this.state.colors.titleTextColor }}>{this.state.title}</a>
                </h2>
                <img className="Podcast-Image" src={this.state.imageUrl} alt={this.state.title} />
                <p className="Podcast-Description">{this.state.description}</p>
                {this.state.episodes.length > 0 ? this.renderEpisodes() : ""}
            </div>
        );
    }
}
