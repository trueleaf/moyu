import Mock from "mockjs";

const { Random } = Mock;

Random.extend({
    name() {
        const result = [
            "小白",
            "小黑",
        ];
        return this.pick(result);
    },
});

export default Mock;
