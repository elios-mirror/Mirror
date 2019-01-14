import { Module, Controller } from 'elios-sdk';
import * as fs from 'fs';
var Imap = require('imap'),
  inspect = require('util').inspect,
  DomParser = require('dom-parser'),
  path = require('path');

export default class Email implements Module {
  name: string = '';
  installId: string = '';

  requireVersion: string = '0.0.1';
  showOnStart: boolean = true;

  widget: any;
  it: any;

  parser = new DomParser();
  dom: any;

  imap = new Imap({
    user: 'tanguy.lelievre@epitech.eu',
    password: 'supermotdepasseepitech;',
    host: 'IMAP-mail.Outlook.com',
    port: 993,
    tls: true
  });


  constructor(private elios: Controller) {
  }

  init() {
    console.log('MODULE DEV LOADED ' + this.name);
  }

  openInbox = (cb: Function) => {
    this.imap.openBox('INBOX', true, cb);
  }

  connect = () => {
    this.imap.connect();
  }

  start() {
    console.log('MODULE STARTED ' + this.name);

    console.log('Construtor');
    this.widget = this.elios.createWidget({
      id: this.installId
    });

    const html = require('./index.html');
    this.dom = this.parser.parseFromString(html);

    console.log('DOM: ', this.dom);

    const date = new Date();

    this.imap.once('ready', () => {
      this.openInbox((err: any, box: any) => {
        if (err) throw err;
        this.imap.search(['UNSEEN', ['SENTON', date]], (err: any, results: any) => {
          if (err) throw err;
          var f = this.imap.fetch(results, { bodies: '' });
          f.on('message', function (msg: any, seqno: any) {
            var prefix = '(#' + seqno + ') ';
            msg.on('body', function (stream: any, info: any) {
              console.log(prefix + 'Body');
              stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
            });
            msg.once('attributes', function (attrs: any) {
              console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
            });
            msg.once('end', function () {
              console.log(prefix + 'Finished');
            });
          });
          f.once('error', function (err: any) {
            console.log('Fetch error: ' + err);
          });
          f.once('end', () => {
            console.log('Done fetching all messages!');
            this.imap.end();
          });
        });
      });
    });

    this.imap.once('error', (err: any) => {
      console.log(err);
    });

    this.imap.once('end', function () {
      console.log('Connection ended');
    });

    this.widget.html.next(this.dom.rawHTML);


    // this.imap.connect();

  }


  stop() {
    console.log('MODULE STOPED ' + this.name);
  }
}
