// @flow

import _ from 'lodash';

type Coord = Array<number>;

const boardStates: { [string]: Array<number> } = {};

class Board {
  
  data: Array<string> = _.times(9, _.constant('-'));
  lastPlayed: ?string = null;

  static DIAG_PRIMARY = 0;
  static DIAG_SECONDARY = 1;

  play(coord: Coord, player: string) {
    const row = coord[0];
    const col = coord[1];
    this.data[row * 3 + col] = player;
    this.lastPlayed = player;
  }

  reset() {
    this.data = _.times(9, _.constant('-'));
    this.lastPlayed = null;
  }

  randomOpenCoord(): null | Coord {

    let indices = [];
    this.data.forEach((d, j) => {
      if (d === '-') indices.push(j);
    });

    if (indices.length === 0) return null;

    const index = _.sample(indices);
    const row = index / 3 | 0;
    const col = index % 3;

    return [row, col];
  }

  row(i: number): string {
    return this.data.slice(i * 3, (i + 1) * 3).join('');
  }

  col(i: number): string {
    return this.data.filter((d, j) => j % 3 === i).join('');
  }

  diag(which: number): string {
    if (which === Board.DIAG_PRIMARY) {
      return this.data.filter((d, j) => j % 4 === 0).join('');
    } else if (which === Board.DIAG_SECONDARY) {
      return this.data.filter((d, j) => j % 2 === 0 && j % 8 > 0).join('');
    }
    return 'ERROR';
  }

  over(): false | string {

    const x = 'xxx';
    const o = 'ooo';

    const possibilities = [
      this.row(0),
      this.row(1),
      this.row(2),
      this.col(0),
      this.col(1),
      this.col(2),
      this.diag(Board.DIAG_PRIMARY),
      this.diag(Board.DIAG_SECONDARY)
    ];

    // has x or o won?
    for (let i = 0; i < possibilities.length; i++) {
      if (possibilities[i] === x) return 'x';
      if (possibilities[i] === o) return 'o';
    }

    // might be a draw
    if (this.data.filter(d => d === '-').length === 0) return 'draw';

    // not over
    return false;
  }
}

class Player {

  board: Board;
  learns: boolean = false;
  type: string;
  wins: number = 0;

  constructor(type: string, board: Board) {
    this.board = board;
    this.type = type;
  }

  optimumCoord(): null | Coord {

    const possibilities: Array<{ board: string, coord: Coord }> = [];
    let optimum = this.board.randomOpenCoord();
    let optimumValue = 0;

    this.board.data.forEach((d, i) => {
      const row = i / 3 | 0;
      const col = i % 3;
      if (d === '-') possibilities.push({
        board: this.board.data.map((d, j) => j === i ? this.type : d).join(''),
        coord: [row, col]
      });
    });

    possibilities.forEach(possibility => {

      const { board, coord } = possibility;
      const valueArr: ?Array<number> = boardStates[board];
      if (!valueArr) return;

      const value: number = valueArr.reduce((a, b) => a + b) / valueArr.length;

      // want highest for x
      if (this.type === 'x' && value > optimumValue) {
        optimumValue = value;
        optimum = coord;
      }

      // want lowest for o
      if (this.type === 'o' && value < optimumValue) {
        optimumValue = value;
        optimum = coord;
      }
    });

    return optimum;
  }

  play() {
    
    const coord = this.learns ? this.optimumCoord() : this.board.randomOpenCoord();
    if (coord === null) return;

    this.board.play(coord, this.type);
  }
}

export default class TicTacToe {

  board: Board = new Board();
  boardStates = boardStates;
  draws: number = 0;
  p1: Player = new Player('x', this.board);
  p2: Player = new Player('o', this.board);

  play() {

    this.board.reset();

    const states: Array<string> = [];

    let over: false | string = false;

    do {

      const player = this.board.lastPlayed === 'x' ? this.p2 : this.p1;
      player.play();

      const data = this.board.data.join('');
      states.push(data);

      over = this.board.over();

    } while (over === false);

    states.forEach(state => {

      if (!boardStates[state]) boardStates[state] = [];
      
      const value = over === 'draw' ? 0 : over === 'x' ? 1 : -1;
      boardStates[state].push(value);

    });

    if (over === 'x') this.p1.wins++;
    if (over === 'o') this.p2.wins++;
    if (over === 'draw') this.draws++;
  }
}