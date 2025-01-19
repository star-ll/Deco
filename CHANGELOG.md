    # Changelog

    ## [0.3.6] - 2025-01-19

    ### Changed

    - Add Deco Plugin support.
    - Add `GlobalStylePlugin` to support global style.

    ## [0.3.5] - 2025-01-18

    ### Changed

    - '@Store' decorator is deprecated. Use '@UseStore' instead.
    - Fix Store error when using `@UseStore` decorator in nested object.
    - Optimize deep reactive: only writable properties are deeply make reactive.
    - Change `@UseStore` decorator example.
