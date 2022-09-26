const utils = require('../../utils');

describe('Utils test', () => {
    describe('traceIdAnt()', ()=> {
        it('Generate trace with Ant financial standard', ()=> {
            expect(utils.traceIdAnt()).toHaveLength(30);
        });
    });
    describe('traceId()', ()=> {
        it('Generate trace', ()=> {
            expect(utils.traceId()).toHaveLength(16);
        });
    });

});