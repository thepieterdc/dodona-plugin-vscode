export {};

declare global {
    interface String {
        /**
         * Converts the string to titlecase.
         *
         * @example "something".titlecase() === "Something"
         * @return titlecased version of the string
         */
        titlecase(): string;
    }
}

String.prototype.titlecase = function() {
    const orig = String(this);
    if (orig.length <= 1) {
        return orig;
    }
    return orig.charAt(0).toUpperCase() + orig.substring(1).toLowerCase();
};