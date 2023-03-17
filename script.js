"use strict";
// Количество выводимых репозиториев
let count = 10;
//Основная функция, запускаемая после загрузки страницы. Ничего не возвращает
window.onload = () => {
    const nodes = {
        searchForm: document.getElementById('search-form'),
        searchInput: document.getElementById('search-input'),
        searchButton: document.getElementById('search-button'),

        resultField: document.getElementById('result'),
    }
    
    nodes.searchForm.addEventListener('submit', (e) => {
        e.preventDefault()
        showResult(nodes.searchInput.value, nodes.resultField);
    })

    nodes.searchInput.focus()
}

//функция отображающая результат поиска. Ничего не возвращает
function showResult(searchStr, field) {
        getData(searchStr, field).then((repos) => {
            if (repos.length) {
                field.innerHTML = repos.map(renderData).join('')
            } else {
                field.innerHTML = '<p>Ничего не найдено<p>';
            }
        }).catch(() => {
            field.innerHTML = '<p>Ошибка</p>';
        })
    
            
    

}

//Функция получающие данные от GitHub, возвращает объект с данными
async function getData(searchStr, field) {
    field.innerHTML = "<p>Подождите, идет загрузка данных</p>"
    let p = await fetch(`https://api.github.com/search/repositories?per_page=${count}&q=${searchStr}`);
    let reader = await p.body.getReader();
    let decoder = new TextDecoder();
    let data = '';
    while(true) {
    let { done, value } = await reader.read();
    data+=decoder.decode(value);
    if(done)
    break;
    }
    data = JSON.parse(data)
    
    return data.items.map((item) => {
        return {
            title: item.name,
            description: item.description,
            link: item.html_url,
            language: item.language,
            topics: item.topics,
            author: {
            name: item.owner?.login,
            avatar: item.owner?.avatar_url,
            link: item.owner?.html_url
            }
        }
    })
}

//Функция для создания HTML, с результатами поиска. Возращает говый HTML код

function renderData({title, description, link, language, topics, author}) {
    topics.length = topics.length > 5 ? 5 : topics.length;
    let topicsHTML = '';
    if (topics.length) {
        for (let item of topics) {
            topicsHTML += `<p class="item__topic">${item}</p>`
        }
    }
    return `
            <div class="result__item item">
            <div class="item__main">
                <img src="${author.avatar}" alt="${author.name}" class="item__image">
                <div class="item__inform">
                    <p class="item__owner item-contacts">Владелец:<a href="${author.link}" class="item__owner-link item-links">${author.name}</a></p>
                    <p class="item__title item-contacts">Репозиторий:<a href="${link}" class="item__title-link item-links">${title}</a></p>
                    <p class="item__language">Основной язык: <span class="item__language-sp">${language}</span></p>
                    <p class="item__description">${description || 'Без описания'}</p>
                </div> 
            </div>
            <div class="item__topics">
                ${topicsHTML}
            </div>
        </div>
 `
}