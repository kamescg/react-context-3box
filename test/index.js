import { assert } from 'chai';
import box from '3box';


describe('Verify Dependencies', () => {
  it('should test 3box is installed', () => {
    assert.typeOf(box, 'function');
  });
});
