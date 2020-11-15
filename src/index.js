import _ from 'lodash';
import {authenticateFn} from './authenticate.js';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());

$().ready(function() {
   $("#authenticate").click(authenticateFn);
});
