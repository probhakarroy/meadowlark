/* eslint-disable no-undef */
suite('Global Tests', () => {
    test('page has a valid title', () => {
        assert(document.title && document.title.match(/\s/) && 
        document.title.toUpperCase() !== 'TODO');
    });
});