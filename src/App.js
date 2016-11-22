import React, { Component } from 'react';
import Podcast from './components/Podcast';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Podcast url="http://feeds.gimletmedia.com/hearstartup" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/hearreplyall" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/heavyweightpodcast" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/sciencevs" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/crimetownshow" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/homecomingshow" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/undoneshow" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/surprisinglyawesome" max={5} />
        <Podcast url="http://feeds.gimletmedia.com/mysteryshow" />
        <Podcast url="http://feeds.gimletmedia.com/hearopenforbusiness" />
        <Podcast url="http://feeds.gimletmedia.com/samplershow" max={5}/>
      </div>
    );
  }
}

export default App;
