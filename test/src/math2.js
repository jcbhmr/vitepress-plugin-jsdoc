export class MathNumber {
  /** @type {number} */
  #x
  /**
   * @param {number} x 
   */
  constructor(x) {
    this.#x = x
  }

  /**
 * Multiplies two numbers. Extremely complicated.
   * @param {number} y 
   */
  multiply(y) {
    return this.#x * y;
  }
}