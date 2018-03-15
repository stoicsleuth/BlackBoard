import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import fetchLatLong from './modules/address';
import typeAhead from './modules/typeAhead';
import ajaxHeart from './modules/heart';
import ajaxFollow from './modules/follow';

fetchLatLong($('#address'),$('#lat'), $('#lng'));

document.querySelectorAll('.link.search').on('click',()=>{
    // document.querySelector('.nav').style.display = 'block';
    // document.querySelector('.nav__section--user').style.display = 'none';
    // let children = document.querySelectorAll('.nav__section--pages li:not(:last-child)');
    // for(let i=0;i<children.length;i++)
    //     children[i].style.display = 'none';
	document.querySelectorAll('#searching')[0].classList.add('active');
	document.querySelectorAll('#searchThis input')[0].focus();
});

document.querySelectorAll('.responsive-search').on('click',()=>{
    // document.querySelector('.nav').style.display = 'block';
    // document.querySelector('.nav__section--user').style.display = 'none';
    // let children = document.querySelectorAll('.nav__section--pages li:not(:last-child)');
    // for(let i=0;i<children.length;i++)
    //     children[i].style.display = 'none';
	document.querySelectorAll('.responsive-searching')[0].classList.add('active');
	document.querySelectorAll('.responsive-searching input')[0].focus();
});
document.querySelectorAll('#closeSearch').on('click',()=>{
    // document.querySelector('.nav').style.display = 'none';
    document.querySelector('#searching').classList.remove('active');
	document.querySelector('#searchThis input').blur();
    document.querySelector('#searchThis input').value('');
    while (document.querySelector('#searchResults').firstChild) {
        document.querySelector('#searchResults').removeChild(document.querySelector('#searchResults').firstChild);
    }
});

document.querySelectorAll('.responsive-closeSearch').on('click',()=>{
    // document.querySelector('.nav').style.display = 'none';
    document.querySelector('.responsive-searching').classList.remove('active');
	document.querySelector('.responsive-searching input').blur();
    document.querySelector('.responsive-searching input').value('');
    while (document.querySelector('.responsive-searchResults').firstChild) {
        document.querySelector('.responsive-searchResults').removeChild(document.querySelector('.responsive-searchResults').firstChild);
    }
});


const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);

const followForm = $$('form.follow-user');
followForm.on('submit', ajaxFollow);

document.querySelector('.side-menu').on('click', ()=>{
    document.querySelector('.menu').classList.add('show-me');
});

document.querySelector('.exit').on('click', ()=>{
    document.querySelector('.menu').classList.remove('show-me');
});

typeAhead( $('#searching') );
typeAhead( $('.responsive-searching') );


//accordion menu for F.A.Q

const items = document.querySelectorAll(".accordion a");

function toggleAccordion(){
  this.classList.toggle('active');
  this.nextElementSibling.classList.toggle('active');
}

items.forEach(item => item.addEventListener('click', toggleAccordion));

if(document.querySelector('.mychoice')){
    document.querySelector('.mychoice').on('input', ()=>{ 
        if(document.querySelector('.mychoice').value.length>2) 
            document.querySelector('.mychoice').name='tags';
        else document.querySelector('.mychoice').name='';
    });
}
