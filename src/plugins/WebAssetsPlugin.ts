import Spin from "../Spin";
import { ConfigPlugin } from "../ConfigPlugin";
import { Builder } from "../Builder";

export default class WebAssetsPlugin implements ConfigPlugin {
    configure(builder: Builder, spin: Spin) {
        const stack = builder.stack;

        if (stack.hasAll(['webpack', 'web']) ||
            (stack.hasAll(['webpack', 'server']) && spin.options.ssr)) {
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        {
                            test: /\.(png|ico|jpg|xml)$/,
                            use: {
                                loader: 'url-loader',
                                options: {
                                    name: '[hash].[ext]',
                                    limit: 100000,
                                },
                            },
                        },
                        {
                            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            use: {
                                loader: 'url-loader',
                                options: {
                                    name: './assets/[hash].[ext]',
                                    limit: 100000,
                                },
                            },
                        },
                        {
                            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            use: {
                                loader: 'file-loader',
                                options: {
                                    name: './assets/[hash].[ext]',
                                },
                            },
                        },
                    ]
                }
            });
        } else if (stack.hasAll(['webpack', 'server']) && !spin.options.ssr) {
            builder.config = spin.merge(builder.config, {
                module: {
                    rules: [
                        {
                            test: /\.(png|ico|jpg|xml)$/,
                            use: {
                                loader: 'ignore-loader',
                            },
                        },
                        {
                            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            use: {
                                loader: 'ignore-loader',
                            },
                        },
                        {
                            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            use: {
                                loader: 'ignore-loader',
                            },
                        },
                    ]
                }
            });
        }
    }
}