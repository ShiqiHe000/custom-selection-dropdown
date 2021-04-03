export default class Select {
    constructor(element) {
        this.element = element;
        this.options = getFormattedOptions(element.querySelectorAll('option'));
        this.customElement = document.createElement('div');
        this.labelElement = document.createElement('span');
        this.optionsCustomElement = document.createElement('ul');
        setUpCustomElement(this);
        element.style.display= 'none'; // hide the old selector
        element.after(this.customElement);
    }

    get selectedOption() {
        return this.options.find(option => option.selected);
    }

    get selectedOptionIndex() {
        return this.options.findIndex(option => option.selected);
    }

    // set the selected option to be selected: true, and the span element text to be the new selected element's label.
    selectValue(value) {
        const newSelectedOption = this.options.find(option => option.value === value);
        const previousSelectedOption = this.selectedOption;
        previousSelectedOption.selected = false;
        previousSelectedOption.element.selected = false;
        newSelectedOption.selected = true;
        newSelectedOption.element.selected = true;

        // set the text
        this.labelElement.innerText = newSelectedOption.label;
        
                
        this.optionsCustomElement.querySelector(`[data-value="${previousSelectedOption.value}"]`).classList.remove('selected');

        const newCustomElement = this.optionsCustomElement.querySelector(`[data-value="${newSelectedOption.value}"]`);
        newCustomElement.classList.add('selected');
        newCustomElement.scrollIntoView({block: 'nearest'});
    }
}

function getFormattedOptions(optionElements) {
    return [...optionElements].map(optionElement => {
        // return as an object
        return {
            value: optionElement.value, // e.g. OH
            label: optionElement.label, // e.g. Ohio
            selected: optionElement.selected, 
            element: optionElement
        }
    })
}

let debounceTimeout
let searchTerm = "";

function setUpCustomElement(select){
    select.customElement.classList.add('custom-select-container');
    select.customElement.tabIndex = 0;  // allow this element to be focused 

    select.labelElement.classList.add('custom-select-value');
    select.labelElement.innerText = select.selectedOption.label;
    select.customElement.appendChild(select.labelElement);

    select.optionsCustomElement.classList.add('custom-select-options');
    select.options.forEach(option => {
        const optionElement = document.createElement('li');
        optionElement.classList.add('custom-select-option');
        optionElement.classList.toggle('selected', option.selected);
        optionElement.innerText = option.label;
        optionElement.dataset.value = option.value;
        optionElement.addEventListener('click', () => {
            // set new span text and options object value
            select.selectValue(option.value);

            select.optionsCustomElement.classList.remove('show');
        })
        select.optionsCustomElement.appendChild(optionElement);
    })
    select.customElement.appendChild(select.optionsCustomElement);

    select.labelElement.addEventListener('click', () => {
        select.optionsCustomElement.classList.toggle('show');
    })

    // close the drop down if we lost focus on the container  
    select.customElement.addEventListener('blur', () => {
        select.optionsCustomElement.classList.remove('show');
    })

    select.customElement.addEventListener('keydown', e => {
        switch(e.code) {
            case 'Space':  // close or open the drop down
            case 'Enter':{
                select.optionsCustomElement.classList.toggle('show');
                break;
            }
            case 'ArrowUp': {// change the selection
                const prevOption = select.options[select.selectedOptionIndex - 1];
                if(prevOption){
                    select.selectValue(prevOption.value);
                }
                break;
            }
            case 'ArrowDown':{
                const nextOption = select.options[select.selectedOptionIndex + 1];
                if(nextOption){
                    select.selectValue(nextOption.value);
                }
                break;
            }
            case 'Escape': { // close the drop down
                select.optionsCustomElement.classList.remove('show');
                break;
            }
            default: {// search by typying the characters
                clearTimeout(debounceTimeout);
                searchTerm += e.key;
                debounceTimeout = setTimeout(() => {searchTerm = ""}, 1000);
                // matchSearch(select);

                const searchedOption = select.options.find(option => {
                    return option.label.toLowerCase().startsWith(searchTerm.toLowerCase());
                });

                if(searchedOption) {
                    select.selectValue(searchedOption.value);
                }
            }
        }
    })
}


