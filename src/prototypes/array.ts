export {};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> {
        /**
         * Finds max element in an Array.
         *
         * @example [1, 2].max() == 2
         * @return max element
         */
        max(): number;
    }
}

Array.prototype.max = function () {
    if (this.length === 0) {
        return 0;
    }

    return this.reduce((acc, value) => {
        return Math.max(acc, value);
    }, 0);
};
