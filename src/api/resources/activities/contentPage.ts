import Activity from "./activity";

/**
 * An content page on Dodona.
 */
export interface ContentPage extends Activity {
    has_read: boolean;
}

export default ContentPage;