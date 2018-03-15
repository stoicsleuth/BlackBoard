import axios from 'axios';
import { $ } from './bling';

function ajaxFollow(e) {
  e.preventDefault();
 axios
    .post(this.action)
    .then(res => {
    //   console.log('WORKS');
      const isFollowed = this.follow.classList.toggle('following');
      if(this.follow.classList.contains('following'))
        this.follow.textContent = 'Following';
      else
      this.follow.textContent = 'Follow';
    })
    .catch(console.error);
}

export default ajaxFollow;