import Component from "ui/Component";

export enum BucketClasses {
	Main = "bucket",
	Header = "bucket-header",
	Title = "bucket-title",
	Icon = "bucket-icon",
}

export default class Bucket extends Component {

	public header!: Component;
	public title!: Component;
	public icon!: Component;

	protected override onMake () {
		this.classes.add(BucketClasses.Main);

		this.header = Component.create()
			.classes.add(BucketClasses.Header)
			.appendTo(this);

		this.title = Component.create()
			.classes.add(BucketClasses.Title)
			.appendTo(this.header);

		this.icon = Component.create()
			.classes.add(BucketClasses.Icon)
			.appendTo(this.title);
	}
}
