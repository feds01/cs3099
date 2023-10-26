import click


# Copied from https://stackoverflow.com/a/51235564
class MutuallyExclusiveOptions(click.Option):
    """
    Custom class allowing click option to be required only when other options
    specified in 'not_required_if' are not present.

    Example:
        @click.option(
            "--name",
            prompt="Publication Name",
            help="Publication Name",
            cls=MutuallyExclusiveOptions
            type=str,
            not_required_if=["pub_id"],
        )
    """

    def __init__(self, *args, **kwargs):
        self.not_required_if: list = kwargs.pop("not_required_if")

        assert self.not_required_if, "'not_required_if' parameter required"
        kwargs["help"] = (
            kwargs.get("help", "")
            + " (Option is mutually exclusive with "
            + ", ".join(self.not_required_if)
            + ")."
        ).strip()
        super(MutuallyExclusiveOptions, self).__init__(*args, **kwargs)

    def handle_parse_result(self, ctx, opts, args):
        current_opt: bool = self.name in opts
        for mutex_opt in self.not_required_if:
            if mutex_opt in opts:
                if current_opt:
                    raise click.UsageError(
                        "Illegal usage: '"
                        + str(self.name)
                        + "' is mutually exclusive with "
                        + str(mutex_opt)
                        + "."
                    )
                else:
                    self.prompt = None
        return super(MutuallyExclusiveOptions, self).handle_parse_result(
            ctx, opts, args
        )
