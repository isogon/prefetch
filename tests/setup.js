import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import jsdom from 'jsdom';
import chaiEnzyme from 'chai-enzyme';

global.chai = chai;
global.expect = chai.expect;
global.sinon = sinon;

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = window.navigator;


function branch(condition) {
  const o = {};
  o.left = (left) => {
    if (condition) {
      o.result = typeof left === 'function' ? left() : left;
    }
    return o;
  };
  o.right = (right) => {
    if (!condition) {
      return typeof right === 'function' ? right() : right;
    }
    return o.result;
  };
  return o;
}

global.branch = branch;

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property];
  }
});

chai.use(chaiEnzyme());
chai.use(sinonChai);
chai.use(chaiAsPromised);
