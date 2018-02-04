// @flow

import React, { Component } from 'react';
import './App.css';

import TicTacToe from './tictactoe/TicTacToe';

type Props = {};
type State = {
  i: number,
  message: string,
  player: 'x' | 'o'
}

class App extends Component<Props, State> {

  t: TicTacToe = new TicTacToe();

  play: Function;
  reset: Function;
  start: Function;

  constructor() {
    
    super();

    this.state = {
      i: 0,
      player: 'x',
      message: ''
    };

    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.start = this.start.bind(this);
  }

  componentDidMount() {

    const p1 = this.t.p1;
    const p2 = this.t.p2;
    
    // get a decent (random) baseline
    for (let i = 0; i < 3000; i++) {
      this.t.play();
    }

    p1.learns = true;
    p2.learns = true;

    // then, start training based off of baseline
    for (let i = 0; i < 10000; i++) {
      this.t.play();
    }

    // reset
    this.reset();
  }

  start() {

    const player = Math.random() > 0.5 ? 'x' : 'o';

    if (player === 'o') this.t.p1.play();

    this.setState({
      player,
      message: `You are player ${player}`
    });
  }

  reset() {
    this.t.board.reset();
    this.start();
  }

  play(e: UIEvent) {
    
    // $FlowFixMe
    const target: HTMLElement = e.target;
    const row = +target.getAttribute('data-row');
    const col = +target.getAttribute('data-col');

    if (this.t.board.data[row * 3 + col] !== '-') return;
    
    this.t.board.play([row, col], this.state.player);

    const other = this.state.player === 'x' ? this.t.p2 : this.t.p1;
    
    if (this.t.board.over() === false) {
      other.play();

      if (this.t.board.over() !== false) {
        this.setState({
          message: `Player ${this.t.board.over()} won!`
        })
      }
    } else {
      this.setState({
        message: `Player ${this.t.board.over()} won!`
      })
    }

    this.setState({
      i: this.state.i + 1
    })
  }

  render() {

    const style = {
      fontFamily: 'monospace',
      fontSize: 24,
      margin: '20px 0'
    }

    const underline = {
      textDecoration: 'underline'
    }

    const d = (i: number): string => {
      let data = this.t.board.data[i];
      if (data === '-') data = '`';
      return data;
    };

    const cell = (i: number) => {
      
      const row = i / 3 | 0;
      const col = i % 3;

      return <span data-col={col} data-row={row} onClick={this.play}>{d(i)}</span>
    };

    const board = (
      <div style={style}>
        <div style={underline}>
          {cell(0)}|{cell(1)}|{cell(2)}
        </div>
        <div style={underline}>
          {cell(3)}|{cell(4)}|{cell(5)}
        </div>
        <div>
          {cell(6)}|{cell(7)}|{cell(8)}
        </div>
      </div>
    );


    return (
      <div className="App">
        {this.state.message}

        {board}

        <button onClick={this.reset}>Reset</button>
      </div>
    );
  }
}

export default App;
